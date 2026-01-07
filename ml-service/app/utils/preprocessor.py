"""
Data preprocessing utilities
Handles scaling, encoding, and data validation
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from typing import Tuple, List, Optional
import logging
import joblib

from app.config import TEST_SIZE, RANDOM_STATE, ALL_FEATURES, API_FEATURES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Preprocess data for model training"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
    
    def fit_transform(self, df: pd.DataFrame, target_col: str = 'recovered') -> Tuple[pd.DataFrame, pd.Series]:
        """
        Fit and transform data
        
        Args:
            df: Input DataFrame
            target_col: Name of target column
            
        Returns:
            Tuple of (X_scaled, y)
        """
        logger.info("Fitting and transforming data...")
        
        # Separate features and target
        if target_col in df.columns:
            y = df[target_col]
            X = df.drop(columns=[target_col])
        else:
            raise ValueError(f"Target column '{target_col}' not found in DataFrame")
        
        # Remove any rows with NaN in target
        valid_idx = ~y.isna()
        X = X[valid_idx]
        y = y[valid_idx]
        
        logger.info(f"Data shape after removing NaN targets: {X.shape}")
        
        # Handle categorical columns
        X = self._encode_categorical(X, fit=True)
        
        # Handle remaining missing values
        X = X.fillna(X.median())
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        # Scale features
        X_scaled = pd.DataFrame(
            self.scaler.fit_transform(X),
            columns=X.columns,
            index=X.index
        )
        
        logger.info(f"Preprocessed data: X shape {X_scaled.shape}, y shape {y.shape}")
        
        return X_scaled, y
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transform new data using fitted preprocessor
        
        Args:
            df: Input DataFrame
            
        Returns:
            Scaled DataFrame
        """
        logger.info("Transforming new data...")
        
        # Encode categorical columns
        X = self._encode_categorical(df, fit=False)
        
        # Handle missing values
        X = X.fillna(X.median())
        
        # Ensure all expected features are present
        for feature in self.feature_names:
            if feature not in X.columns:
                X[feature] = 0
        
        # Keep only expected features in correct order
        X = X[self.feature_names]
        
        # Scale
        X_scaled = pd.DataFrame(
            self.scaler.transform(X),
            columns=X.columns,
            index=X.index
        )
        
        return X_scaled
    
    def _encode_categorical(self, df: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        """
        Encode categorical columns
        
        Args:
            df: Input DataFrame
            fit: Whether to fit encoders
            
        Returns:
            DataFrame with encoded categorical columns
        """
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        
        if len(categorical_cols) > 0:
            logger.info(f"Encoding {len(categorical_cols)} categorical columns")
            
            for col in categorical_cols:
                if fit:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    if col in self.label_encoders:
                        # Handle unseen categories
                        le = self.label_encoders[col]
                        df[col] = df[col].astype(str).apply(
                            lambda x: le.transform([x])[0] if x in le.classes_ else -1
                        )
                    else:
                        df[col] = 0  # Default for unknown categorical
        
        return df
    
    def split_data(
        self, 
        X: pd.DataFrame, 
        y: pd.Series, 
        test_size: float = TEST_SIZE,
        random_state: int = RANDOM_STATE
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """
        Split data into train and test sets
        
        Args:
            X: Features
            y: Target
            test_size: Proportion of test set
            random_state: Random seed
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        logger.info(f"Splitting data: {test_size*100}% test, {(1-test_size)*100}% train")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=test_size, 
            random_state=random_state,
            stratify=y
        )
        
        logger.info(f"Train set: {X_train.shape}, Test set: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    def save(self, path: str):
        """Save preprocessor to file"""
        joblib.dump({
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names
        }, path)
        logger.info(f"Saved preprocessor to {path}")
    
    def load(self, path: str):
        """Load preprocessor from file"""
        data = joblib.load(path)
        self.scaler = data['scaler']
        self.label_encoders = data['label_encoders']
        self.feature_names = data['feature_names']
        logger.info(f"Loaded preprocessor from {path}")


class DataValidator:
    """Validate data quality and integrity"""
    
    @staticmethod
    def validate_features(df: pd.DataFrame, required_features: List[str]) -> bool:
        """
        Validate that DataFrame has required features
        
        Args:
            df: Input DataFrame
            required_features: List of required feature names
            
        Returns:
            True if valid, raises ValueError otherwise
        """
        missing_features = set(required_features) - set(df.columns)
        
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
        
        logger.info(f"Validated {len(required_features)} required features")
        return True
    
    @staticmethod
    def validate_data_types(df: pd.DataFrame) -> bool:
        """
        Validate data types
        
        Args:
            df: Input DataFrame
            
        Returns:
            True if valid
        """
        # Check for object columns that should be numeric
        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    pd.to_numeric(df[col])
                    logger.warning(f"Column '{col}' is object but could be numeric")
                except:
                    pass
        
        return True
    
    @staticmethod
    def validate_ranges(df: pd.DataFrame) -> bool:
        """
        Validate that numeric values are in reasonable ranges
        
        Args:
            df: Input DataFrame
            
        Returns:
            True if valid
        """
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if df[col].min() < -1e10 or df[col].max() > 1e10:
                logger.warning(f"Column '{col}' has extreme values: [{df[col].min()}, {df[col].max()}]")
        
        return True
    
    @staticmethod
    def check_class_balance(y: pd.Series, threshold: float = 0.1) -> dict:
        """
        Check class balance in target variable
        
        Args:
            y: Target variable
            threshold: Minimum acceptable proportion for minority class
            
        Returns:
            Dictionary with class distribution info
        """
        value_counts = y.value_counts()
        proportions = y.value_counts(normalize=True)
        
        balance_info = {
            'counts': value_counts.to_dict(),
            'proportions': proportions.to_dict(),
            'is_balanced': proportions.min() >= threshold
        }
        
        logger.info(f"Class distribution: {balance_info['proportions']}")
        
        if not balance_info['is_balanced']:
            logger.warning(f"Class imbalance detected! Minority class: {proportions.min():.2%}")
        
        return balance_info
