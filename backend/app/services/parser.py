import networkx as nx
import ast
import yaml
from typing import Dict, Optional
from .code_metrics import CodeMetricsAnalyzer


class FlowchartParser:
    def __init__(self):
        self.graph = nx.DiGraph()


    def parse_python_code(self, content: str) -> nx.DiGraph:
        """Parse Python code and extract function relationships."""
        tree = ast.parse(content)
        metrics_analyzer = CodeMetricsAnalyzer()

        builtin_functions = set(dir(__builtins__))
        user_functions = {}  # Map of {function_name: full_qualified_name}
        self.graph = nx.DiGraph()
        
        def get_parent_class(node):
            """Helper function to find parent class of a function"""
            for parent in ast.walk(tree):
                if isinstance(parent, ast.ClassDef):
                    for child in ast.iter_child_nodes(parent):
                        if child is node:
                            return parent
            return None
        
        # First pass: collect all classes and functions
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                class_name = node.name
                # Add class node
                self.graph.add_node(
                    class_name,
                    type="class",
                    metadata={
                        "lineno": node.lineno,
                        "docstring": ast.get_docstring(node)
                    }
                )
                
                # Add methods
                for item in node.body:
                    # Changed this condition - it was checking 'node' instead of 'item'
                    if isinstance(item, ast.FunctionDef):
                        metrics = metrics_analyzer.analyze_function(item)  # Changed to use item
                        method_name = f"{class_name}.{item.name}"
                        user_functions[item.name] = method_name
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
                    metrics = metrics_analyzer.analyze_function(node)  # Added metrics for standalone functions
                    user_functions[node.name] = node.name
                    self.graph.add_node(
                        node.name,
                        type="function",
                        metadata={
                            **metrics,
                            'is_dead_code': True
                        }
                    )
                
        
        # Second pass: analyze function calls
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                current_function = node.name
                parent_class = get_parent_class(node)
                if parent_class:
                    current_function = f"{parent_class.name}.{node.name}"
                
                # Analyze function body for calls
                for child in ast.walk(node):
                    if isinstance(child, ast.Call):
                        called_func = None
                        
                        # Handle different types of calls
                        if isinstance(child.func, ast.Name):
                            # Direct function call
                            called_func = child.func.id
                        elif isinstance(child.func, ast.Attribute):
                            # Method call (e.g., self.method or obj.method)
                            if isinstance(child.func.value, ast.Name):
                                if child.func.value.id == 'self':
                                    # self.method() call
                                    if parent_class:
                                        called_func = f"{parent_class.name}.{child.func.attr}"
                                else:
                                    # Could be a call to another object's method
                                    called_func = child.func.attr
                        
                        # Add edge if it's calling a user-defined function or method
                        if called_func and called_func not in builtin_functions:
                            target_func = user_functions.get(called_func, called_func)
                            if target_func in [n for n in self.graph.nodes()]:
                                self.graph.add_edge(
                                    current_function,
                                    target_func,
                                    type="calls",
                                    relationship="calls"
                                )
        

        # After creating all nodes and edges, analyze dead code
        called_functions = set()
        for edge in self.graph.edges(data=True):
            if edge[2].get('type') == 'calls':
                # Use edge[1] which is the target node of the edge
                called_functions.add(edge[1])
        
        # Update dead code status for all nodes
        for node, data in self.graph.nodes(data=True):
            if data.get('type') in ['function', 'method']:
                # A function is not dead if:
                # 1. It's being called
                # 2. It's a class method (might be called externally)
                # 3. It starts with test_ (test functions)
                is_dead = (
                    node not in called_functions and
                    '.' not in node and  # Not a class method
                    not node.startswith('test_')  # Not a test function
                )
                if 'metadata' not in data:
                    data['metadata'] = {}
                data['metadata']['is_dead_code'] = is_dead
            
            
        return self.graph



    def parse_yaml(self, content: str) -> nx.DiGraph:
        """Parse YAML workflow definitions."""
        data = yaml.safe_load(content)
        
        def process_workflow(workflow: Dict, parent: Optional[str] = None):
            for step_name, step_data in workflow.items():
                self.graph.add_node(
                    step_name,
                    type="workflow_step",
                    metadata=step_data.get("metadata", {})
                )
                
                if parent:
                    self.graph.add_edge(parent, step_name)
                
                if "next" in step_data:
                    self.graph.add_edge(step_name, step_data["next"])
                
                if "substeps" in step_data:
                    process_workflow(step_data["substeps"], step_name)
        
        process_workflow(data)
        return self.graph

    def parse_text(self, content: str) -> nx.DiGraph:
        """Parse text in a simple way without spaCy."""
        lines = content.split('\n')
        prev_node = None
        
        for line in lines:
            line = line.strip()
            if line:
                self.graph.add_node(line, type="text_step")
                if prev_node:
                    self.graph.add_edge(prev_node, line)
                prev_node = line
        
        return self.graph