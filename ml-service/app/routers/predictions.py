"""
Prediction API router
Implements endpoints as per roadmap specification
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelInfoResponse
)
from app.models.model_service import model_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/recovery", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_recovery(request: PredictionRequest):
    """
    Predict recovery probability for a single case
    
    Args:
        request: Prediction request with case features
        
    Returns:
        Prediction response with probability, risk category, and strategy
    """
    try:
        logger.info(f"Received prediction request: {request.dict()}")
        
        # Convert request to dictionary
        features = request.dict()
        
        # Make prediction
        result = model_service.predict(features)
        
        logger.info(f"Prediction result: {result}")
        
        return PredictionResponse(**result)
        
    except RuntimeError as e:
        logger.error(f"Model not loaded: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Please train the model first."
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making prediction: {str(e)}"
        )


@router.post("/batch", response_model=BatchPredictionResponse, status_code=status.HTTP_200_OK)
async def predict_batch(request: BatchPredictionRequest):
    """
    Predict recovery probability for multiple cases
    
    Args:
        request: Batch prediction request with list of cases
        
    Returns:
        Batch prediction response with list of predictions
    """
    try:
        logger.info(f"Received batch prediction request with {len(request.cases)} cases")
        
        # Convert requests to dictionaries
        cases = [case.dict() for case in request.cases]
        
        # Make batch predictions
        results = model_service.predict_batch(cases)
        
        # Convert to response models
        predictions = [PredictionResponse(**result) for result in results]
        
        logger.info(f"Batch prediction completed: {len(predictions)} predictions")
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_cases=len(predictions)
        )
        
    except RuntimeError as e:
        logger.error(f"Model not loaded: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Please train the model first."
        )
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making batch predictions: {str(e)}"
        )


@router.get("/model-info", response_model=ModelInfoResponse, status_code=status.HTTP_200_OK)
async def get_model_info():
    """
    Get information about the loaded model
    
    Returns:
        Model information including version, metrics, and features
    """
    try:
        if not model_service.is_model_loaded():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Model is not loaded. Please train the model first."
            )
        
        metadata = model_service.get_metadata()
        
        if not metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model metadata not found"
            )
        
        return ModelInfoResponse(**metadata)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving model information: {str(e)}"
        )
