import networkx as nx
import ast
import yaml
from typing import Dict, Optional

class FlowchartParser:
    def __init__(self):
        self.graph = nx.DiGraph()

    def parse_python_code(self, content: str) -> nx.DiGraph:
        """Parse Python code and extract function relationships."""
        tree = ast.parse(content)
        builtin_functions = dir(__builtins__)
        
        # Track function definitions and calls
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                self.graph.add_node(
                    node.name,
                    type="function",
                    metadata={
                        "lineno": node.lineno,
                        "args": [arg.arg for arg in node.args.args],
                        "docstring": ast.get_docstring(node)
                    }
                )
                
                # Analyze function body for calls
                for child in ast.walk(node):
                    if isinstance(child, ast.Call) and isinstance(child.func, ast.Name):
                        target_func = child.func.id
                        if target_func in builtin_functions:
                            self.graph.add_node(
                                target_func,
                                type="builtin",
                                metadata={"description": f"Python built-in function: {target_func}"}
                            )
                            self.graph.add_edge(
                                node.name,
                                target_func,
                                type="builtin"
                            )
                        else:
                            self.graph.add_edge(node.name, target_func)
        
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