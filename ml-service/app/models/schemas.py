"""
Pydantic schemas for API request/response models
"""
from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    """Request model for recovery prediction (as per roadmap API specification)"""
    debt_amount: float = Field(..., description="Current outstanding debt amount", gt=0)
    days_past_due: int = Field(..., description="Number of days payment is overdue", ge=0)
    credit_score: float = Field(..., description="Credit score (300-850)", ge=300, le=850)
    payment_attempts: int = Field(..., description="Number of payment attempts made", ge=0)
    communication_count: int = Field(..., description="Total communications sent", ge=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "debt_amount": 5000.0,
                "days_past_due": 45,
                "credit_score": 650.0,
                "payment_attempts": 3,
                "communication_count": 5
            }
        }


class PredictionResponse(BaseModel):
    """Response model for recovery prediction"""
    recovery_probability: float = Field(..., description="Probability of debt recovery (0-1)")
    risk_category: str = Field(..., description="Risk category: LOW_RISK, MEDIUM_RISK, or HIGH_RISK")
    recommended_strategy: str = Field(..., description="Recommended strategy: STANDARD_FOLLOW_UP, NEGOTIATION_OFFER, or ESCALATION")
    
    class Config:
        json_schema_extra = {
            "example": {
                "recovery_probability": 0.7234,
                "risk_category": "LOW_RISK",
                "recommended_strategy": "STANDARD_FOLLOW_UP"
            }
        }


class BatchPredictionRequest(BaseModel):
    """Request model for batch predictions"""
    cases: list[PredictionRequest] = Field(..., description="List of cases to predict")
    
    class Config:
        json_schema_extra = {
            "example": {
                "cases": [
                    {
                        "debt_amount": 5000.0,
                        "days_past_due": 45,
                        "credit_score": 650.0,
                        "payment_attempts": 3,
                        "communication_count": 5
                    },
                    {
                        "debt_amount": 10000.0,
                        "days_past_due": 90,
                        "credit_score": 580.0,
                        "payment_attempts": 1,
                        "communication_count": 2
                    }
                ]
            }
        }


class BatchPredictionResponse(BaseModel):
    """Response model for batch predictions"""
    predictions: list[PredictionResponse] = Field(..., description="List of predictions")
    total_cases: int = Field(..., description="Total number of cases processed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "predictions": [
                    {
                        "recovery_probability": 0.7234,
                        "risk_category": "LOW_RISK",
                        "recommended_strategy": "STANDARD_FOLLOW_UP"
                    },
                    {
                        "recovery_probability": 0.3456,
                        "risk_category": "HIGH_RISK",
                        "recommended_strategy": "ESCALATION"
                    }
                ],
                "total_cases": 2
            }
        }


class ModelInfoResponse(BaseModel):
    """Response model for model information"""
    model_version: str = Field(..., description="Model version")
    model_name: str = Field(..., description="Model type/name")
    training_date: str = Field(..., description="Date when model was trained")
    metrics: dict = Field(..., description="Model performance metrics")
    num_features: int = Field(..., description="Number of features used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "model_version": "1.0.0",
                "model_name": "XGBoost",
                "training_date": "2026-01-06T23:00:00",
                "metrics": {
                    "accuracy": 0.8523,
                    "roc_auc": 0.8912,
                    "f1_score": 0.8456
                },
                "num_features": 17
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    model_loaded: bool = Field(..., description="Whether model is loaded")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "service": "ml-service",
                "model_loaded": True
            }
        }
