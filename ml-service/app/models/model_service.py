"""
Model service for loading and managing ML models
Implements singleton pattern for model caching
"""
import joblib
import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional
import logging

from app.config import MODEL_PATH, SCALER_PATH, METADATA_PATH, RISK_THRESHOLDS, STRATEGY_MAP, API_FEATURES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelService:
    """Singleton service for model management"""
    
    _instance = None
    _model = None
    _preprocessor = None
    _metadata = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize model service"""
        if self._model is None:
            self.load_model()
    
    def load_model(self):
        """Load model, preprocessor, and metadata"""
        try:
            logger.info("Loading model artifacts...")
            
            # Load model
            if MODEL_PATH.exists():
                self._model = joblib.load(MODEL_PATH)
                logger.info(f"✅ Loaded model from {MODEL_PATH}")
            else:
                logger.warning(f"⚠️ Model not found at {MODEL_PATH}")
                self._model = None
            
            # Load preprocessor
            if SCALER_PATH.exists():
                preprocessor_data = joblib.load(SCALER_PATH)
                self._preprocessor = preprocessor_data
                logger.info(f"✅ Loaded preprocessor from {SCALER_PATH}")
            else:
                logger.warning(f"⚠️ Preprocessor not found at {SCALER_PATH}")
                self._preprocessor = None
            
            # Load metadata
            if METADATA_PATH.exists():
                with open(METADATA_PATH, 'r') as f:
                    self._metadata = json.load(f)
                logger.info(f"✅ Loaded metadata from {METADATA_PATH}")
            else:
                logger.warning(f"⚠️ Metadata not found at {METADATA_PATH}")
                self._metadata = {}
            
        except Exception as e:
            logger.error(f"❌ Error loading model artifacts: {e}")
            raise
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self._model is not None
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get model metadata"""
        return self._metadata if self._metadata else {}
    
    def preprocess_features(self, features: Dict[str, float]) -> np.ndarray:
        """
        Preprocess features for prediction
        
        Args:
            features: Dictionary with feature values
            
        Returns:
            Preprocessed feature array
        """
        # Create DataFrame from API features
        df = pd.DataFrame([features])
        
        # Ensure all required features are present
        for feature in API_FEATURES:
            if feature not in df.columns:
                df[feature] = 0
        
        # If we have a preprocessor, use it
        if self._preprocessor:
            scaler = self._preprocessor.get('scaler')
            feature_names = self._preprocessor.get('feature_names', API_FEATURES)
            
            # Add missing features with default values
            for feature in feature_names:
                if feature not in df.columns:
                    df[feature] = 0
            
            # Select and order features
            df = df[feature_names]
            
            # Scale
            if scaler:
                features_array = scaler.transform(df)
            else:
                features_array = df.values
        else:
            # No preprocessor, use raw features
            df = df[API_FEATURES]
            features_array = df.values
        
        return features_array
    
    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Make prediction for a single case
        
        Args:
            features: Dictionary with feature values
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_model_loaded():
            raise RuntimeError("Model is not loaded. Please train the model first.")
        
        try:
            # Preprocess features
            features_array = self.preprocess_features(features)
            
            # Get probability
            probability = self._model.predict_proba(features_array)[0][1]
            
            # Determine risk category and strategy
            risk_category, strategy = self._categorize_risk(probability)
            
            return {
                'recovery_probability': round(float(probability), 4),
                'risk_category': risk_category,
                'recommended_strategy': strategy
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}")
            raise
    
    def predict_batch(self, cases: list) -> list:
        """
        Make predictions for multiple cases
        
        Args:
            cases: List of feature dictionaries
            
        Returns:
            List of prediction results
        """
        if not self.is_model_loaded():
            raise RuntimeError("Model is not loaded. Please train the model first.")
        
        try:
            predictions = []
            
            for case in cases:
                prediction = self.predict(case)
                predictions.append(prediction)
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error making batch predictions: {e}")
            raise
    
    def _categorize_risk(self, probability: float) -> tuple:
        """
        Categorize risk based on recovery probability
        
        Args:
            probability: Recovery probability (0-1)
            
        Returns:
            Tuple of (risk_category, recommended_strategy)
        """
        if probability >= RISK_THRESHOLDS['LOW_RISK']:
            return 'LOW_RISK', STRATEGY_MAP['LOW_RISK']
        elif probability >= RISK_THRESHOLDS['MEDIUM_RISK']:
            return 'MEDIUM_RISK', STRATEGY_MAP['MEDIUM_RISK']
        else:
            return 'HIGH_RISK', STRATEGY_MAP['HIGH_RISK']


# Global model service instance
model_service = ModelService()
