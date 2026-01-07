"""
Data loading utilities for ML Service
Handles loading and initial preprocessing of all datasets
"""
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, Optional
import logging

from app.config import (
    LENDING_CLUB_PATH,
    UCI_CREDIT_CARD_PATH,
    INDIAN_BANK_EXTERNAL_PATH,
    INDIAN_BANK_INTERNAL_PATH
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    """Load and preprocess datasets"""
    
    @staticmethod
    def load_lending_club(nrows: Optional[int] = None, sample_frac: float = 0.1) -> pd.DataFrame:
        """
        Load Lending Club dataset (primary dataset - 800K+ records)
        
        Args:
            nrows: Number of rows to load (None for all)
            sample_frac: Fraction to sample if nrows is None (default 0.1 = 10%)
            
        Returns:
            DataFrame with loaded data
        """
        logger.info(f"Loading Lending Club dataset from {LENDING_CLUB_PATH}")
        
        try:
            # Load with selected columns to reduce memory
            # We'll select relevant columns for debt recovery prediction
            usecols = [
                'loan_amnt', 'funded_amnt', 'term', 'int_rate', 'installment',
                'grade', 'sub_grade', 'emp_length', 'home_ownership', 'annual_inc',
                'verification_status', 'loan_status', 'purpose', 'dti',
                'delinq_2yrs', 'inq_last_6mths', 'open_acc', 'pub_rec',
                'revol_bal', 'revol_util', 'total_acc', 'out_prncp', 'out_prncp_inv',
                'total_pymnt', 'total_rec_prncp', 'total_rec_int', 'recoveries',
                'collection_recovery_fee', 'last_pymnt_amnt'
            ]
            
            if nrows:
                df = pd.read_csv(LENDING_CLUB_PATH, nrows=nrows, low_memory=False)
            else:
                # Sample to reduce memory usage
                df = pd.read_csv(LENDING_CLUB_PATH, low_memory=False)
                if sample_frac < 1.0:
                    df = df.sample(frac=sample_frac, random_state=42)
                    logger.info(f"Sampled {len(df)} records ({sample_frac*100}%)")
            
            logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns")
            return df
            
        except Exception as e:
            logger.error(f"Error loading Lending Club dataset: {e}")
            raise
    
    @staticmethod
    def load_uci_credit_card() -> pd.DataFrame:
        """
        Load UCI Credit Card Default dataset (30K records)
        
        Returns:
            DataFrame with loaded data
        """
        logger.info(f"Loading UCI Credit Card dataset from {UCI_CREDIT_CARD_PATH}")
        
        try:
            # Load XLS file, skip first row if it's metadata
            df = pd.read_excel(UCI_CREDIT_CARD_PATH, header=1)
            logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns")
            return df
            
        except Exception as e:
            logger.error(f"Error loading UCI dataset: {e}")
            raise
    
    @staticmethod
    def load_indian_bank_external() -> pd.DataFrame:
        """Load Indian Bank External CIBIL dataset"""
        logger.info(f"Loading Indian Bank External dataset from {INDIAN_BANK_EXTERNAL_PATH}")
        
        try:
            df = pd.read_excel(INDIAN_BANK_EXTERNAL_PATH)
            logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns")
            return df
        except Exception as e:
            logger.error(f"Error loading Indian Bank External dataset: {e}")
            raise
    
    @staticmethod
    def load_indian_bank_internal() -> pd.DataFrame:
        """Load Indian Bank Internal dataset"""
        logger.info(f"Loading Indian Bank Internal dataset from {INDIAN_BANK_INTERNAL_PATH}")
        
        try:
            df = pd.read_excel(INDIAN_BANK_INTERNAL_PATH)
            logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns")
            return df
        except Exception as e:
            logger.error(f"Error loading Indian Bank Internal dataset: {e}")
            raise
    
    @staticmethod
    def clean_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and preprocess data
        
        Args:
            df: Input DataFrame
            
        Returns:
            Cleaned DataFrame
        """
        logger.info("Cleaning data...")
        
        # Remove duplicates
        initial_rows = len(df)
        df = df.drop_duplicates()
        logger.info(f"Removed {initial_rows - len(df)} duplicate rows")
        
        # Handle missing values
        missing_pct = (df.isnull().sum() / len(df) * 100).round(2)
        high_missing = missing_pct[missing_pct > 50]
        
        if len(high_missing) > 0:
            logger.warning(f"Columns with >50% missing: {high_missing.to_dict()}")
            # Drop columns with >80% missing
            cols_to_drop = missing_pct[missing_pct > 80].index.tolist()
            if cols_to_drop:
                df = df.drop(columns=cols_to_drop)
                logger.info(f"Dropped columns: {cols_to_drop}")
        
        return df
    
    @staticmethod
    def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values in dataset
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with handled missing values
        """
        logger.info("Handling missing values...")
        
        # Numeric columns: fill with median
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if df[col].isnull().sum() > 0:
                df[col].fillna(df[col].median(), inplace=True)
        
        # Categorical columns: fill with mode or 'Unknown'
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if df[col].isnull().sum() > 0:
                mode_val = df[col].mode()
                if len(mode_val) > 0:
                    df[col].fillna(mode_val[0], inplace=True)
                else:
                    df[col].fillna('Unknown', inplace=True)
        
        logger.info(f"Missing values after handling: {df.isnull().sum().sum()}")
        return df
    
    @staticmethod
    def remove_outliers(df: pd.DataFrame, columns: list, n_std: float = 3.0) -> pd.DataFrame:
        """
        Remove outliers using z-score method
        
        Args:
            df: Input DataFrame
            columns: Columns to check for outliers
            n_std: Number of standard deviations for threshold
            
        Returns:
            DataFrame with outliers removed
        """
        logger.info(f"Removing outliers from {len(columns)} columns...")
        
        initial_rows = len(df)
        
        for col in columns:
            if col in df.columns and df[col].dtype in [np.float64, np.int64]:
                mean = df[col].mean()
                std = df[col].std()
                df = df[np.abs(df[col] - mean) <= (n_std * std)]
        
        logger.info(f"Removed {initial_rows - len(df)} outlier rows")
        return df
