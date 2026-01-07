# Atlas DCA ML Service - Complete Documentation

## Overview

The Atlas DCA ML Service is a FastAPI-based machine learning service that predicts debt recovery probability using advanced ensemble models. It implements Phase 3 of the Atlas DCA roadmap.

---

## Features

✅ **Multiple Dataset Support**: Lending Club (800K+ records), UCI Credit Card (30K records), Indian Bank datasets  
✅ **Three ML Models**: Random Forest, XGBoost, Gradient Boosting with automatic best model selection  
✅ **Comprehensive Feature Engineering**: 17+ features across debtor, case, and behavioral categories  
✅ **RESTful API**: Single and batch prediction endpoints  
✅ **Risk Categorization**: Automatic classification into LOW/MEDIUM/HIGH risk with recommended strategies  
✅ **Production Ready**: Model caching, error handling, comprehensive logging  

---

## Quick Start

### 1. Installation

```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Train the Model

```bash
python -m app.training.train_model
```

This will:
- Load and preprocess datasets
- Engineer features
- Train Random Forest, XGBoost, and Gradient Boosting models
- Perform 5-fold cross-validation
- Select best model based on ROC-AUC
- Save model artifacts to `models/`

Expected output:
```
🏆 BEST MODEL: XGBoost (or Random Forest/Gradient Boosting)
📊 ROC-AUC: 0.85+
🎯 Accuracy: 0.80+
📈 F1 Score: 0.78+
```

### 3. Start the API Server

```bash
uvicorn app.main:app --reload --port 8000
```

The service will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## API Endpoints

### 1. Single Prediction

**Endpoint**: `POST /predictions/recovery`

**Request Body**:
```json
{
  "debt_amount": 5000.0,
  "days_past_due": 45,
  "credit_score": 650.0,
  "payment_attempts": 3,
  "communication_count": 5
}
```

**Response**:
```json
{
  "recovery_probability": 0.7234,
  "risk_category": "LOW_RISK",
  "recommended_strategy": "STANDARD_FOLLOW_UP"
}
```

**cURL Example**:
```bash
curl -X POST "http://localhost:8000/predictions/recovery" \
  -H "Content-Type: application/json" \
  -d '{
    "debt_amount": 5000.0,
    "days_past_due": 45,
    "credit_score": 650.0,
    "payment_attempts": 3,
    "communication_count": 5
  }'
```

**Python Example**:
```python
import requests

url = "http://localhost:8000/predictions/recovery"
payload = {
    "debt_amount": 5000.0,
    "days_past_due": 45,
    "credit_score": 650.0,
    "payment_attempts": 3,
    "communication_count": 5
}

response = requests.post(url, json=payload)
print(response.json())
```

---

### 2. Batch Prediction

**Endpoint**: `POST /predictions/batch`

**Request Body**:
```json
{
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
```

**Response**:
```json
{
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
```

---

### 3. Model Information

**Endpoint**: `GET /predictions/model-info`

**Response**:
```json
{
  "model_version": "1.0.0",
  "model_name": "XGBoost",
  "training_date": "2026-01-06T23:00:00",
  "metrics": {
    "accuracy": 0.8523,
    "roc_auc": 0.8912,
    "f1_score": 0.8456,
    "cv_scores_mean": 0.8834,
    "cv_scores_std": 0.0123
  },
  "num_features": 17
}
```

---

### 4. Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "ml-service",
  "model_loaded": true
}
```

---

## Feature Specifications

The API accepts 5 core features (as per roadmap):

| Feature | Type | Description | Range |
|---------|------|-------------|-------|
| `debt_amount` | float | Current outstanding debt | > 0 |
| `days_past_due` | int | Days payment is overdue | ≥ 0 |
| `credit_score` | float | FICO credit score | 300-850 |
| `payment_attempts` | int | Number of payment attempts | ≥ 0 |
| `communication_count` | int | Total communications sent | ≥ 0 |

Internally, the model uses 17+ engineered features across three categories:
- **Debtor Features**: credit_score, income_level, employment_status, debt_to_income_ratio, previous_defaults
- **Case Features**: debt_amount, days_past_due, original_amount, payment_attempts, communication_count
- **Behavioral Features**: response_rate, promise_to_pay_count, partial_payment_history, communication_preference

---

## Risk Categories & Strategies

| Risk Category | Recovery Probability | Recommended Strategy |
|--------------|---------------------|---------------------|
| **LOW_RISK** | ≥ 70% | STANDARD_FOLLOW_UP |
| **MEDIUM_RISK** | 40% - 69% | NEGOTIATION_OFFER |
| **HIGH_RISK** | < 40% | ESCALATION |

---

## Model Training Details

### Datasets Used

1. **Lending Club Loan Data** (Primary)
   - 800,000+ records
   - Comprehensive loan and payment history
   - Location: `data/Loan data/loan.csv`

2. **UCI Credit Card Default** (Supplementary)
   - 30,000 records
   - Credit card payment data
   - Location: `data/default-of-credit-card-clients.xls`

3. **Indian Bank Datasets** (Validation)
   - External CIBIL, Internal Bank, Unseen test data
   - Location: `data/Indian Bank Dataset/`

### Models Trained

1. **Random Forest**
   - n_estimators: 200
   - max_depth: 15
   - min_samples_split: 10

2. **XGBoost**
   - n_estimators: 200
   - max_depth: 6
   - learning_rate: 0.1

3. **Gradient Boosting**
   - n_estimators: 200
   - max_depth: 5
   - learning_rate: 0.1

### Evaluation Metrics

- **ROC-AUC Score**: Primary metric for model selection
- **Accuracy**: Overall prediction accuracy
- **F1 Score**: Balance of precision and recall
- **5-Fold Cross-Validation**: Ensures model generalization

---

## Testing

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_predictions.py -v
```

### Test Coverage

- ✅ API endpoint validation
- ✅ Request/response schema validation
- ✅ Edge case handling
- ✅ Error handling
- ✅ Model loading verification

---

## Project Structure

```
ml-service/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration settings
│   ├── routers/
│   │   └── predictions.py      # Prediction endpoints
│   ├── models/
│   │   ├── schemas.py          # Pydantic models
│   │   └── model_service.py    # Model management
│   ├── training/
│   │   ├── train_model.py      # Training pipeline
│   │   └── model_evaluator.py  # Evaluation utilities
│   └── utils/
│       ├── data_loader.py      # Dataset loading
│       ├── feature_engineering.py  # Feature creation
│       └── preprocessor.py     # Data preprocessing
├── data/                       # Datasets
├── models/                     # Saved model artifacts
├── tests/                      # Test suite
└── requirements.txt            # Dependencies
```

---

## Troubleshooting

### Model Not Loaded Error

**Error**: `Model is not loaded. Please train the model first.`

**Solution**: Run the training script:
```bash
python -m app.training.train_model
```

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**: Run from the ml-service directory:
```bash
cd ml-service
python -m app.training.train_model
```

### Memory Issues with Large Dataset

**Solution**: The training script samples 10% of Lending Club data by default. Adjust in `data_loader.py`:
```python
df = DataLoader.load_lending_club(sample_frac=0.05)  # Use 5% instead
```

---

## Performance Benchmarks

- **Single Prediction**: < 200ms
- **Batch Prediction (100 cases)**: < 2 seconds
- **Model Loading**: < 5 seconds
- **Training Time**: 10-30 minutes (depending on dataset size)

---

## Integration with Backend

To integrate with the Node.js backend:

```javascript
// backend/src/services/mlService.js
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function predictRecovery(caseData) {
  const response = await axios.post(`${ML_SERVICE_URL}/predictions/recovery`, {
    debt_amount: caseData.amount,
    days_past_due: caseData.daysPastDue,
    credit_score: caseData.debtor.creditScore,
    payment_attempts: caseData.paymentAttempts,
    communication_count: caseData.communicationCount
  });
  
  return response.data;
}
```

---

## Production Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

```bash
LOG_LEVEL=INFO
MODEL_PATH=/app/models/recovery_model.pkl
```

---

## License

Part of the Atlas DCA project.

---

## Support

For issues or questions, refer to the main project documentation or raise an issue in the project repository.
