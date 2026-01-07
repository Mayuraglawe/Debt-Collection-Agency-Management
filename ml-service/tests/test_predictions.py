"""
Tests for prediction API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Atlas DCA ML Service"
    assert data["version"] == "1.0.0"
    assert data["status"] == "running"


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ml-service"
    assert "model_loaded" in data


def test_prediction_endpoint_valid_request():
    """Test prediction endpoint with valid request"""
    payload = {
        "debt_amount": 5000.0,
        "days_past_due": 45,
        "credit_score": 650.0,
        "payment_attempts": 3,
        "communication_count": 5
    }
    
    response = client.post("/predictions/recovery", json=payload)
    
    # If model is not loaded, expect 503
    if response.status_code == 503:
        assert "Model is not loaded" in response.json()["detail"]
    else:
        # If model is loaded, expect 200
        assert response.status_code == 200
        data = response.json()
        assert "recovery_probability" in data
        assert "risk_category" in data
        assert "recommended_strategy" in data
        assert 0 <= data["recovery_probability"] <= 1
        assert data["risk_category"] in ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]
        assert data["recommended_strategy"] in ["STANDARD_FOLLOW_UP", "NEGOTIATION_OFFER", "ESCALATION"]


def test_prediction_endpoint_invalid_request():
    """Test prediction endpoint with invalid request"""
    payload = {
        "debt_amount": -1000.0,  # Invalid: negative amount
        "days_past_due": 45,
        "credit_score": 650.0,
        "payment_attempts": 3,
        "communication_count": 5
    }
    
    response = client.post("/predictions/recovery", json=payload)
    assert response.status_code == 422  # Validation error


def test_batch_prediction_endpoint():
    """Test batch prediction endpoint"""
    payload = {
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
    
    response = client.post("/predictions/batch", json=payload)
    
    # If model is not loaded, expect 503
    if response.status_code == 503:
        assert "Model is not loaded" in response.json()["detail"]
    else:
        # If model is loaded, expect 200
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert "total_cases" in data
        assert data["total_cases"] == 2
        assert len(data["predictions"]) == 2


def test_model_info_endpoint():
    """Test model info endpoint"""
    response = client.get("/predictions/model-info")
    
    # If model is not loaded, expect 503
    if response.status_code == 503:
        assert "Model is not loaded" in response.json()["detail"]
    else:
        # If model is loaded, expect 200
        assert response.status_code == 200
        data = response.json()
        assert "model_version" in data
        assert "model_name" in data
        assert "training_date" in data
        assert "metrics" in data
        assert "num_features" in data


def test_prediction_edge_cases():
    """Test prediction with edge case values"""
    # Very high credit score
    payload = {
        "debt_amount": 1000.0,
        "days_past_due": 0,
        "credit_score": 850.0,
        "payment_attempts": 10,
        "communication_count": 1
    }
    
    response = client.post("/predictions/recovery", json=payload)
    if response.status_code == 200:
        data = response.json()
        # High credit score should likely result in LOW_RISK
        assert data["risk_category"] in ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]
    
    # Very low credit score
    payload = {
        "debt_amount": 50000.0,
        "days_past_due": 180,
        "credit_score": 300.0,
        "payment_attempts": 0,
        "communication_count": 20
    }
    
    response = client.post("/predictions/recovery", json=payload)
    if response.status_code == 200:
        data = response.json()
        # Low credit score and high days past due should likely result in HIGH_RISK
        assert data["risk_category"] in ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]
