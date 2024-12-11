from fastapi import APIRouter, UploadFile, File
from models.schemas import FlowchartRequest
from services.generator import FlowchartGenerator
import os
from services.project_analyzer import ProjectAnalyzer
import tempfile
import shutil
import zipfile

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
    return generator.generate_flowchart(content_str, input_type)




@router.post("/analyze-project/")
async def analyze_project(file: UploadFile = File(...)):
    """Analyze a zipped project directory."""
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
        
        return response