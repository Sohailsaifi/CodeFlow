from services.parser import FlowchartParser
from models.schemas import FlowchartNode, FlowchartEdge
from typing import Dict

class FlowchartGenerator:
    def __init__(self):
        self.parser = FlowchartParser()

    def generate_flowchart(self, content: str, input_type: str) -> Dict:
        """Generate flowchart from input content."""
        if input_type == "python":
            graph = self.parser.parse_python_code(content)
        elif input_type == "yaml":
            graph = self.parser.parse_yaml(content)
        elif input_type == "text":
            graph = self.parser.parse_text(content)
        else:
            raise ValueError(f"Unsupported input type: {input_type}")

        # Convert networkx graph to flowchart format
        nodes = []
        edges = []

        for node, data in graph.nodes(data=True):
            nodes.append(FlowchartNode(
                id=str(node),
                label=str(node),
                type=data.get("type", "default"),
                metadata=data.get("metadata", {})
            ))

        for source, target, data in graph.edges(data=True):
            edges.append(FlowchartEdge(
                source=str(source),
                target=str(target),
                label=data.get("label")
            ))

        return {
            "nodes": [node.dict() for node in nodes],
            "edges": [edge.dict() for edge in edges]
        }