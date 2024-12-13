import os
import ast
import networkx as nx
from typing import Dict, List, Set
from pathlib import Path
from .code_metrics import CodeMetricsAnalyzer

class ProjectAnalyzer:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.modules = set()
        self.imports = {}
        self.dead_code = set()
        self.metrics_analyzer = CodeMetricsAnalyzer() 

    def analyze_project(self, project_path: str) -> nx.DiGraph:
        """Analyze entire project directory."""
        for root, _, files in os.walk(project_path):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    self._analyze_file(file_path)
        
        self._analyze_dead_code()
        return self.graph

    def _analyze_file(self, file_path: str):
        """Analyze single Python file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Add file node
            file_name = os.path.basename(file_path)
            self.graph.add_node(
                file_name,
                type="file",
                metadata=self._get_file_metrics(content)
            )
            
            # Parse and analyze code
            tree = ast.parse(content)
            self._analyze_imports(tree, file_name)
            self._analyze_functions(tree, file_name)
        except Exception as e:
            print(f"Error analyzing file {file_path}: {str(e)}")

    def _get_file_metrics(self, content: str) -> Dict:
        """Calculate file metrics."""
        return {
            'loc': len(content.splitlines()),
            'functions': 0,
            'classes': 0,
            'imports': 0
        }

    def _analyze_imports(self, tree: ast.AST, file_name: str):
        """Analyze imports in the file."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for name in node.names:
                    self.imports.setdefault(file_name, set()).add(name.name)
                    self.graph.add_edge(
                        file_name,
                        name.name,
                        type="import",
                        relationship="imports"
                    )
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ''
                self.imports.setdefault(file_name, set()).add(module)
                self.graph.add_edge(
                    file_name,
                    module,
                    type="import_from",
                    relationship="imports_from"
                )

    def _analyze_functions(self, tree: ast.AST, file_name: str):
        """Analyze functions and classes in the file."""
        def get_parent_class(node):
            """Helper function to find parent class of a function"""
            for parent in ast.walk(tree):
                if isinstance(parent, ast.ClassDef):
                    for child in ast.iter_child_nodes(parent):
                        if child is node:
                            return parent
            return None

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Add class node
                class_name = node.name
                self.graph.add_node(
                    class_name,
                    type="class",
                    metadata={
                        "lineno": node.lineno,
                        "docstring": ast.get_docstring(node)
                    }
                )
                
                # Add edge from file to class
                self.graph.add_edge(
                    file_name,
                    class_name,
                    type="contains",
                    relationship="contains"
                )
                
                # Add methods
                for item in node.body:
                    if isinstance(item, ast.FunctionDef):
                        metrics = self.metrics_analyzer.analyze_function(item)
                        method_name = f"{class_name}.{item.name}"
                        self.graph.add_node(
                            method_name,
                            type="method",
                            metadata={
                                **metrics,
                                'is_dead_code': True  # Will be updated later
                            }
                        )
                        # Add edge from class to method
                        self.graph.add_edge(
                            class_name,
                            method_name,
                            type="contains",
                            relationship="contains"
                        )
            
            elif isinstance(node, ast.FunctionDef):
                parent_class = get_parent_class(node)
                if not parent_class:  # Standalone function
                    metrics = self.metrics_analyzer.analyze_function(node)
                    self.graph.add_node(
                        node.name,
                        type="function",
                        metadata={
                            **metrics,
                            'is_dead_code': True  # Will be updated later
                        }
                    )
                    # Add edge from file to function
                    self.graph.add_edge(
                        file_name,
                        node.name,
                        type="contains",
                        relationship="contains"
                    )

    def _analyze_function_calls(self, node: ast.AST, function_id: str):
        """Analyze function calls within a function."""
        current_file = function_id.split('::')[0]
        
        for child in ast.walk(node):
            if isinstance(child, ast.Call):
                called_func = None
                
                if isinstance(child.func, ast.Name):
                    # Direct function call
                    base_name = child.func.id
                    possible_targets = [
                        f"{current_file}::{base_name}",  # Same file
                        base_name  # Could be in another file
                    ]
                    for target in possible_targets:
                        if target in self.graph:
                            called_func = target
                            break
                            
                elif isinstance(child.func, ast.Attribute):
                    if isinstance(child.func.value, ast.Name):
                        if child.func.value.id == 'self':
                            # For self.method() calls
                            called_func = f"{current_file}::{child.func.attr}"
                        elif child.func.value.id == 'cls':
                            # For cls.method() calls (classmethods)
                            called_func = f"{current_file}::{child.func.attr}"
                        else:
                            # Handle class method calls like ClassName.method()
                            base_name = child.func.attr
                            possible_targets = [
                                f"{current_file}::{base_name}",
                                base_name
                            ]
                            for target in possible_targets:
                                if target in self.graph:
                                    called_func = target
                                    break
                
                if called_func:
                    self.graph.add_edge(
                        function_id,
                        called_func,
                        type="calls",
                        relationship="calls"
                    )

    def _analyze_dead_code(self):
        """Identify potentially dead code."""
        called_functions = set()
        
        # Collect method calls
        for edge in self.graph.edges(data=True):
            source, target, data = edge
            if data.get('type') == 'calls' or data.get('relationship') == 'calls':
                called_functions.add(target)
                # Also add base name for cross-file calls
                if '::' in target:
                    base_name = target.split('::')[1]
                    called_functions.add(base_name)

        # Consider special methods as "called"
        for node, data in self.graph.nodes(data=True):
            if data.get('type') in ['function', 'method']:
                func_name = node.split('::')[1] if '::' in node else node
                # Special methods that should never be considered dead
                if (func_name.startswith('__') and func_name.endswith('__') or  # All dunder methods
                    func_name.startswith('test_') or  # Test functions
                    any(func_name.startswith(prefix) for prefix in ['from_', 'to_', 'decode_', 'encode_']) or  # Common conversion/coding methods
                    func_name == 'main'):  # Main function
                    called_functions.add(node)
                    called_functions.add(func_name)

        # Update dead code status
        for node, data in self.graph.nodes(data=True):
            if data.get('type') in ['function', 'method']:
                func_name = node.split('::')[1] if '::' in node else node
                is_dead = (
                    node not in called_functions and
                    func_name not in called_functions and
                    not (func_name.startswith('__') and func_name.endswith('__')) and
                    not func_name.startswith('test_') and
                    not any(func_name.startswith(prefix) for prefix in ['from_', 'to_', 'decode_', 'encode_']) and
                    func_name != 'main'
                )
                
                if 'metadata' not in data:
                    data['metadata'] = {}
                data['metadata']['is_dead_code'] = is_dead