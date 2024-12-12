import os
import ast
import networkx as nx
from typing import Dict, List, Set
from pathlib import Path

class ProjectAnalyzer:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.modules = set()
        self.imports = {}
        self.dead_code = set()

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
        """Analyze functions in the file."""
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_id = f"{file_name}::{node.name}"
                self.graph.add_node(
                    function_id,
                    type="function",
                    metadata={
                        'loc': len(node.body),
                        'args': [arg.arg for arg in node.args.args],
                        'docstring': ast.get_docstring(node)
                    }
                )
                
                # Add edge from file to function
                self.graph.add_edge(
                    file_name, 
                    function_id, 
                    type="contains",
                    relationship="contains"
                )
                
                # Analyze function calls
                self._analyze_function_calls(node, function_id)

    def _analyze_function_calls(self, node: ast.AST, function_id: str):
        """Analyze function calls within a function."""
        for child in ast.walk(node):
            if isinstance(child, ast.Call) and isinstance(child.func, ast.Name):
                called_function = child.func.id
                if called_function not in dir(__builtins__):
                    self.graph.add_edge(
                        function_id,
                        called_function,
                        type="calls",
                        relationship="calls"
                    )

    def _analyze_dead_code(self):
        """Identify potentially dead code."""
        called_functions = set()
        for _, _, data in self.graph.edges(data=True):
            if data.get('relationship') == 'calls':
                called_functions.add(data.get('target', ''))
        
        for node, data in self.graph.nodes(data=True):
            if (data.get('type') == 'function' and 
                node not in called_functions and 
                not node.lower().startswith('test_')):
                self.dead_code.add(node)
                data['metadata']['dead_code'] = True