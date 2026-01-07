"""
FastAPI ML Service Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.routers import predictions
from app.models.model_service import model_service
from app.models.schemas import HealthResponse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    logger.info("Starting ML Service...")
    try:
        model_service.load_model()
        logger.info("✅ Model loaded successfully")
    except Exception as e:
        logger.warning(f"⚠️ Could not load model: {e}")
        logger.info("Service will start but predictions will not be available until model is trained")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML Service...")


app = FastAPI(
    title="Atlas DCA ML Service",
    description="Machine Learning service for debt recovery prediction",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predictions.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Atlas DCA ML Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ml-service",
        model_loaded=model_service.is_model_loaded()
    )
