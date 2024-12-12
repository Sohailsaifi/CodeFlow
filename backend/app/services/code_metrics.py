import ast
from typing import Dict, List

class CodeMetricsAnalyzer:
    def __init__(self):
        self.metrics = {}
    
    def analyze_function(self, node: ast.FunctionDef) -> Dict:
        """Analyze a single function/method for various metrics."""
        # Calculate complexity and metrics without needing source code
        complexity = self._calculate_complexity(node)
        
        metrics = {
            'complexity': complexity,
            'lines': len(list(ast.walk(node))),  # Use AST nodes as approximation
            'parameters': len(node.args.args),
            'docstring': ast.get_docstring(node) or "No documentation",
            'line_number': node.lineno,
            'args': [arg.arg for arg in node.args.args],
            'code_smells': self._detect_code_smells(node)
        }
        
        return metrics
    
    def _calculate_complexity(self, node: ast.AST) -> int:
        """Calculate cyclomatic complexity manually."""
        complexity = 1  # Base complexity
        
        for child in ast.walk(node):
            # Control flow statements increase complexity
            if isinstance(child, (ast.If, ast.While, ast.For, ast.AsyncFor,
                               ast.ExceptHandler, ast.AsyncWith,
                               ast.With, ast.Assert)):
                complexity += 1
            # Boolean operations increase complexity
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
            # Return statements can increase complexity
            elif isinstance(child, ast.Return):
                if isinstance(child.value, ast.Compare):
                    complexity += 1
        
        return complexity
    
    def _detect_code_smells(self, node: ast.FunctionDef) -> List[str]:
        """Detect potential code smells in the function."""
        smells = []
        
        # Count total nodes as a measure of function size
        node_count = len(list(ast.walk(node)))
        if node_count > 30:
            smells.append("Large function (too many statements)")
        
        # Check number of parameters
        if len(node.args.args) > 5:
            smells.append("Too many parameters (>5)")
        
        # Check for nested control structures
        max_depth = self._get_max_nesting(node)
        if max_depth > 3:
            smells.append(f"Deep nesting (depth: {max_depth})")
        
        # Check for complex boolean expressions
        for child in ast.walk(node):
            if isinstance(child, ast.BoolOp):
                if len(child.values) > 2:
                    smells.append("Complex boolean expression")
            elif isinstance(child, ast.Compare):
                if len(child.ops) > 2:
                    smells.append("Complex comparison")
        
        # Check for too many local variables
        local_vars = set()
        for child in ast.walk(node):
            if isinstance(child, ast.Name) and isinstance(child.ctx, ast.Store):
                local_vars.add(child.id)
        if len(local_vars) > 10:
            smells.append("Too many local variables (>10)")
        
        return smells
    
    def _get_max_nesting(self, node: ast.AST) -> int:
        """Calculate maximum nesting depth."""
        def _get_depth(node: ast.AST, current_depth: int) -> int:
            max_depth = current_depth
            
            for child in ast.iter_child_nodes(node):
                if isinstance(child, (ast.For, ast.While, ast.If)):
                    child_depth = _get_depth(child, current_depth + 1)
                    max_depth = max(max_depth, child_depth)
                else:
                    child_depth = _get_depth(child, current_depth)
                    max_depth = max(max_depth, child_depth)
            
            return max_depth
        
        return _get_depth(node, 0)