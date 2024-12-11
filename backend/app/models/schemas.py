from pydantic import BaseModel
from typing import Dict, List, Optional

class FlowchartNode(BaseModel):
    id: str
    label: str
    type: str
    metadata: Dict = {}

class FlowchartEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None

class FlowchartRequest(BaseModel):
    content: str
    input_type: str