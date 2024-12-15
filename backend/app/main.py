from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router 
import os 

app = FastAPI(title="Dynamic Flowchart Generator")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "http://localhost:3000")],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)