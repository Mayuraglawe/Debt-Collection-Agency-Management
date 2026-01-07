"""
Configuration settings for ML Service
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Dataset paths
LENDING_CLUB_PATH = DATA_DIR / "Loan data" / "loan.csv"
UCI_CREDIT_CARD_PATH = DATA_DIR / "default-of-credit-card-clients.xls"
INDIAN_BANK_EXTERNAL_PATH = DATA_DIR / "Indian Bank Dataset" / "External_Cibil_Dataset.xlsx"
INDIAN_BANK_INTERNAL_PATH = DATA_DIR / "Indian Bank Dataset" / "Internal_Bank_Dataset.xlsx"
INDIAN_BANK_UNSEEN_PATH = DATA_DIR / "Indian Bank Dataset" / "Unseen_Dataset.xlsx"

# Model paths
MODEL_PATH = MODELS_DIR / "recovery_model.pkl"
SCALER_PATH = MODELS_DIR / "scaler.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

# Feature definitions (as per roadmap)
DEBTOR_FEATURES = [
    'credit_score',
    'income_level', 
    'employment_status',
    'debt_to_income_ratio',
    'previous_defaults'
]

CASE_FEATURES = [
    'debt_amount',
    'days_past_due',
    'original_amount',
    'payment_attempts',
    'communication_count'
]

BEHAVIORAL_FEATURES = [
    'response_rate',
    'promise_to_pay_count',
    'partial_payment_history',
    'communication_preference'
]

ALL_FEATURES = DEBTOR_FEATURES + CASE_FEATURES + BEHAVIORAL_FEATURES

# API prediction features (simplified for API)
API_FEATURES = [
    'debt_amount',
    'days_past_due',
    'credit_score',
    'payment_attempts',
    'communication_count'
]

# Model hyperparameters
RANDOM_FOREST_PARAMS = {
    'n_estimators': 200,
    'max_depth': 15,
    'min_samples_split': 10,
    'min_samples_leaf': 4,
    'random_state': 42,
    'n_jobs': -1
}

XGBOOST_PARAMS = {
    'n_estimators': 200,
    'max_depth': 6,
    'learning_rate': 0.1,
    'objective': 'binary:logistic',
    'random_state': 42,
    'n_jobs': -1
}

GRADIENT_BOOSTING_PARAMS = {
    'n_estimators': 200,
    'max_depth': 5,
    'learning_rate': 0.1,
    'random_state': 42
}

# Training configuration
TEST_SIZE = 0.2
RANDOM_STATE = 42
CV_FOLDS = 5

# Risk thresholds (as per roadmap)
RISK_THRESHOLDS = {
    'LOW_RISK': 0.7,      # >= 70% recovery probability
    'MEDIUM_RISK': 0.4,   # >= 40% recovery probability
    'HIGH_RISK': 0.0      # < 40% recovery probability
}

# Strategy mapping
STRATEGY_MAP = {
    'LOW_RISK': 'STANDARD_FOLLOW_UP',
    'MEDIUM_RISK': 'NEGOTIATION_OFFER',
    'HIGH_RISK': 'ESCALATION'
}

# Model version
MODEL_VERSION = "1.0.0"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
