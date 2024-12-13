from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from fastapi.responses import JSONResponse, FileResponse
from models.schemas import FlowchartRequest
from services.generator import FlowchartGenerator
import os
from services.project_analyzer import ProjectAnalyzer
import tempfile
import shutil
import zipfile
import networkx as nx

router = APIRouter()

@router.post("/generate-flowchart/")
async def generate_flowchart(request: FlowchartRequest):
    generator = FlowchartGenerator()
    return generator.generate_flowchart(request.content, request.input_type)

@router.post("/upload-file/")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    content_str = content.decode()
    
    # Determine input type from file extension
    input_type = file.filename.split('.')[-1].lower()
    if input_type not in ['py', 'yaml', 'yml', 'txt']:
        raise ValueError("Unsupported file type")
    
    input_type = 'python' if input_type == 'py' else 'yaml' if input_type in ['yaml', 'yml'] else 'text'
    
    generator = FlowchartGenerator()

    result = generator.generate_flowchart(content_str, input_type)
    
    # Store the analysis result
    router.current_analysis = generator.parser.graph
    
    return result




@router.post("/analyze-project/")
async def analyze_project(file: UploadFile = File(...)):
    """Analyze a zipped project directory."""
    print(f"Analyzing project from file: {file.filename}")  # Debug log
    
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        # Save uploaded zip file
        zip_path = os.path.join(temp_dir, "project.zip")
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract zip file
        project_dir = os.path.join(temp_dir, "project")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(project_dir)
        
        # Analyze project
        analyzer = ProjectAnalyzer()
        graph = analyzer.analyze_project(project_dir)
        
        # Convert to response format
        response = {
            "nodes": [
                {
                    "id": node,
                    "label": node,
                    "type": data.get("type", "default"),
                    "metadata": data.get("metadata", {})
                }
                for node, data in graph.nodes(data=True)
            ],
            "edges": [
                {
                    "source": source,
                    "target": target,
                    "type": data.get("type", "default")
                }
                for source, target, data in graph.edges(data=True)
            ]
        }
        
        print(f"Analysis complete. Found {len(response['nodes'])} nodes and {len(response['edges'])} edges")  # Debug log
        return response
    
    
@router.get("/export/{format}")
async def export_graph(format: str):
    """Export the current graph in various formats."""
    if not hasattr(router, 'current_analysis'):
        raise HTTPException(status_code=404, detail="No analysis available. Please analyze a file first.")
    
    try:
        if format == "json":
            # JSON export stays the same
            graph_data = {
                "nodes": [
                    {
                        "id": node,
                        "type": data.get("type", ""),
                        "metadata": data.get("metadata", {})
                    }
                    for node, data in router.current_analysis.nodes(data=True)
                ],
                "edges": [
                    {
                        "source": source,
                        "target": target,
                        "type": data.get("type", ""),
                        "relationship": data.get("relationship", "")
                    }
                    for source, target, data in router.current_analysis.edges(data=True)
                ]
            }
            return JSONResponse(content=graph_data)

        elif format in ["svg", "png"]:
            import matplotlib.pyplot as plt
            import matplotlib.patches as mpatches
            from io import BytesIO
            
            # Create figure with white background
            plt.figure(figsize=(20, 16), facecolor='white')
            
            # Use hierarchical layout
            pos = nx.kamada_kawai_layout(router.current_analysis)
            
            # Color schemes matching our tool
            node_colors = {
                'file': '#3b82f6',    # Blue
                'class': '#2563eb',    # Dark Blue
                'function': '#8b5cf6', # Purple
                'method': '#6366f1'    # Indigo
            }
            
            # Draw nodes by type to maintain layering
            node_patches = []  # For legend
            for node_type, color in node_colors.items():
                nodes = [node for node, data in router.current_analysis.nodes(data=True) 
                        if data.get('type') == node_type]
                if nodes:
                    nx.draw_networkx_nodes(router.current_analysis, pos,
                                         nodelist=nodes,
                                         node_color=color,
                                         node_size=3000,
                                         node_shape='s',  # square shape like in tool
                                         alpha=0.9)
                    # Add to legend
                    node_patches.append(mpatches.Patch(color=color, label=node_type.capitalize()))

            # Edge styles matching our tool
            edge_styles = {
                'contains': {'style': 'solid', 'color': '#94a3b8', 'width': 2},
                'calls': {'style': 'solid', 'color': '#6366f1', 'width': 1},
                'import': {'style': 'dashed', 'color': '#10b981', 'width': 1}
            }
            
            # Draw edges
            edge_patches = []  # For legend
            for edge_type, style in edge_styles.items():
                edges = [(u, v) for u, v, d in router.current_analysis.edges(data=True) 
                        if d.get('type') == edge_type]
                if edges:
                    nx.draw_networkx_edges(router.current_analysis, pos,
                                         edgelist=edges,
                                         edge_color=style['color'],
                                         style=style['style'],
                                         width=style['width'],
                                         alpha=0.9,
                                         arrowsize=20)
                    # Add to legend
                    edge_patches.append(mpatches.Patch(color=style['color'], 
                                                     label=f"{edge_type.capitalize()} relationship"))

            # Draw labels with background
            for node, (x, y) in pos.items():
                plt.text(x, y, node.split("::")[-1],
                        fontsize=8,
                        color='white',
                        horizontalalignment='center',
                        verticalalignment='center',
                        bbox=dict(facecolor='none', 
                                edgecolor='none',
                                alpha=0.8))

            # Add legend
            plt.legend(handles=node_patches + edge_patches,
                      loc='upper left',
                      bbox_to_anchor=(1, 1))

            plt.title("Code Structure Visualization", pad=20)
            plt.axis('off')
            plt.tight_layout()

            # Save to BytesIO
            buf = BytesIO()
            if format == 'png':
                plt.savefig(buf, format='png', dpi=300, bbox_inches='tight', 
                           facecolor='white', edgecolor='none')
            else:  # svg
                plt.savefig(buf, format='svg', bbox_inches='tight', 
                           facecolor='white', edgecolor='none')
            plt.close()
            
            # Return the image
            buf.seek(0)
            media_type = "image/png" if format == "png" else "image/svg+xml"
            return Response(
                content=buf.getvalue(),
                media_type=media_type,
                headers={
                    "Content-Disposition": f"attachment; filename=code_analysis.{format}"
                }
            )

    except Exception as e:
        print(f"Error during export: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))