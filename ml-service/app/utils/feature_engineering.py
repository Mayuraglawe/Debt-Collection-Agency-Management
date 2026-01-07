"""
Feature engineering utilities for debt recovery prediction
Implements roadmap-specified feature categories: debtor, case, and behavioral features
"""
import pandas as pd
import numpy as np
from typing import Dict, List
import logging

from app.config import DEBTOR_FEATURES, CASE_FEATURES, BEHAVIORAL_FEATURES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Feature engineering for debt recovery prediction"""
    
    @staticmethod
    def create_lending_club_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from Lending Club dataset
        Maps Lending Club columns to roadmap feature specifications
        
        Args:
            df: Lending Club DataFrame
            
        Returns:
            DataFrame with engineered features
        """
        logger.info("Engineering features from Lending Club dataset...")
        
        features_df = pd.DataFrame()
        
        # DEBTOR FEATURES
        # credit_score - derive from grade/sub_grade
        features_df['credit_score'] = FeatureEngineer._grade_to_credit_score(df.get('grade'), df.get('sub_grade'))
        
        # income_level
        features_df['income_level'] = df.get('annual_inc', 0)
        
        # employment_status - derive from emp_length
        features_df['employment_status'] = FeatureEngineer._encode_employment(df.get('emp_length'))
        
        # debt_to_income_ratio
        features_df['debt_to_income_ratio'] = df.get('dti', 0) / 100.0  # Convert to decimal
        
        # previous_defaults - use delinquencies
        features_df['previous_defaults'] = df.get('delinq_2yrs', 0)
        
        # CASE FEATURES
        # debt_amount - current outstanding principal
        features_df['debt_amount'] = df.get('out_prncp', df.get('loan_amnt', 0))
        
        # days_past_due - calculate from loan status and term
        features_df['days_past_due'] = FeatureEngineer._calculate_days_past_due(df)
        
        # original_amount
        features_df['original_amount'] = df.get('funded_amnt', df.get('loan_amnt', 0))
        
        # payment_attempts - use total accounts as proxy
        features_df['payment_attempts'] = df.get('total_acc', 0)
        
        # communication_count - use inquiries as proxy
        features_df['communication_count'] = df.get('inq_last_6mths', 0)
        
        # BEHAVIORAL FEATURES
        # response_rate - calculate from payment history
        features_df['response_rate'] = FeatureEngineer._calculate_response_rate(df)
        
        # promise_to_pay_count - use public records as proxy
        features_df['promise_to_pay_count'] = df.get('pub_rec', 0)
        
        # partial_payment_history - calculate from payment amounts
        features_df['partial_payment_history'] = FeatureEngineer._calculate_partial_payment_score(df)
        
        # communication_preference - encode based on available data (default to 0)
        features_df['communication_preference'] = 0  # Will be enhanced with actual data
        
        # TARGET VARIABLE - recovered (1) or not (0)
        features_df['recovered'] = FeatureEngineer._create_target_variable(df)
        
        logger.info(f"Created {len(features_df.columns)} features for {len(features_df)} records")
        
        return features_df
    
    @staticmethod
    def _grade_to_credit_score(grade: pd.Series, sub_grade: pd.Series) -> pd.Series:
        """Convert loan grade to approximate credit score"""
        # Lending Club grade mapping to FICO score ranges
        grade_map = {
            'A': 720, 'B': 680, 'C': 640, 'D': 600, 
            'E': 560, 'F': 520, 'G': 480
        }
        
        if grade is None:
            return pd.Series([650] * len(sub_grade) if sub_grade is not None else [650])
        
        base_score = grade.map(grade_map).fillna(650)
        
        # Adjust based on sub_grade (1-5)
        if sub_grade is not None:
            sub_adjustment = sub_grade.str[-1].map({
                '1': 10, '2': 5, '3': 0, '4': -5, '5': -10
            }).fillna(0)
            return base_score + sub_adjustment
        
        return base_score
    
    @staticmethod
    def _encode_employment(emp_length: pd.Series) -> pd.Series:
        """Encode employment length to numeric status"""
        if emp_length is None:
            return pd.Series([1] * 100)  # Default employed
        
        # Convert to numeric: 0=unemployed, 1=employed, 2=long-term employed
        def encode(val):
            if pd.isna(val) or val == 'n/a':
                return 0
            elif '10+' in str(val):
                return 2
            elif any(str(i) in str(val) for i in range(1, 10)):
                return 1
            else:
                return 0
        
        return emp_length.apply(encode)
    
    @staticmethod
    def _calculate_days_past_due(df: pd.DataFrame) -> pd.Series:
        """Calculate days past due from loan status"""
        loan_status = df.get('loan_status', pd.Series(['Current'] * len(df)))
        
        # Map loan status to estimated days past due
        status_map = {
            'Current': 0,
            'Fully Paid': 0,
            'In Grace Period': 15,
            'Late (16-30 days)': 23,
            'Late (31-120 days)': 75,
            'Default': 150,
            'Charged Off': 180
        }
        
        return loan_status.map(status_map).fillna(0)
    
    @staticmethod
    def _calculate_response_rate(df: pd.DataFrame) -> pd.Series:
        """Calculate response rate from payment behavior"""
        total_pymnt = df.get('total_pymnt', 0)
        funded_amnt = df.get('funded_amnt', 1)
        
        # Response rate = (total paid / funded amount), capped at 1.0
        response_rate = (total_pymnt / funded_amnt.replace(0, 1)).clip(0, 1)
        return response_rate
    
    @staticmethod
    def _calculate_partial_payment_score(df: pd.DataFrame) -> pd.Series:
        """Calculate partial payment history score"""
        total_rec_prncp = df.get('total_rec_prncp', 0)
        funded_amnt = df.get('funded_amnt', 1)
        
        # Partial payment score = principal recovered / funded amount
        partial_score = (total_rec_prncp / funded_amnt.replace(0, 1)).clip(0, 1)
        return partial_score
    
    @staticmethod
    def _create_target_variable(df: pd.DataFrame) -> pd.Series:
        """Create binary target variable: recovered (1) or not (0)"""
        loan_status = df.get('loan_status', pd.Series(['Current'] * len(df)))
        
        # Positive outcomes (recovered)
        recovered_statuses = ['Fully Paid', 'Current']
        
        # Negative outcomes (not recovered)
        not_recovered_statuses = ['Charged Off', 'Default', 'Late (31-120 days)']
        
        target = loan_status.apply(
            lambda x: 1 if x in recovered_statuses else (0 if x in not_recovered_statuses else np.nan)
        )
        
        return target
    
    @staticmethod
    def create_uci_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from UCI Credit Card dataset
        
        Args:
            df: UCI Credit Card DataFrame
            
        Returns:
            DataFrame with engineered features
        """
        logger.info("Engineering features from UCI Credit Card dataset...")
        
        features_df = pd.DataFrame()
        
        # Map UCI columns to our feature schema
        # DEBTOR FEATURES
        features_df['credit_score'] = FeatureEngineer._estimate_credit_score_uci(df)
        features_df['income_level'] = df.get('LIMIT_BAL', 0)  # Credit limit as proxy
        features_df['employment_status'] = df.get('EDUCATION', 1)  # Education as proxy
        features_df['debt_to_income_ratio'] = FeatureEngineer._calculate_dti_uci(df)
        features_df['previous_defaults'] = df[[col for col in df.columns if 'PAY_' in col]].max(axis=1)
        
        # CASE FEATURES
        features_df['debt_amount'] = df[[col for col in df.columns if 'BILL_AMT' in col]].iloc[:, 0]
        features_df['days_past_due'] = df.get('PAY_0', 0) * 30  # Convert to days
        features_df['original_amount'] = df.get('LIMIT_BAL', 0)
        features_df['payment_attempts'] = (df[[col for col in df.columns if 'PAY_AMT' in col]] > 0).sum(axis=1)
        features_df['communication_count'] = 5  # Default value
        
        # BEHAVIORAL FEATURES
        features_df['response_rate'] = FeatureEngineer._calculate_payment_rate_uci(df)
        features_df['promise_to_pay_count'] = 0  # Not available in UCI
        features_df['partial_payment_history'] = FeatureEngineer._calculate_partial_payment_uci(df)
        features_df['communication_preference'] = 0
        
        # TARGET
        features_df['recovered'] = 1 - df.get('default payment next month', 0)  # Invert default
        
        logger.info(f"Created {len(features_df.columns)} features for {len(features_df)} records")
        
        return features_df
    
    @staticmethod
    def _estimate_credit_score_uci(df: pd.DataFrame) -> pd.Series:
        """Estimate credit score from UCI data"""
        limit_bal = df.get('LIMIT_BAL', 50000)
        # Higher limit = better credit score (rough approximation)
        credit_score = 300 + (limit_bal / 1000).clip(0, 550)
        return credit_score
    
    @staticmethod
    def _calculate_dti_uci(df: pd.DataFrame) -> pd.Series:
        """Calculate debt-to-income ratio from UCI data"""
        bill_cols = [col for col in df.columns if 'BILL_AMT' in col]
        if bill_cols:
            avg_bill = df[bill_cols].mean(axis=1)
            limit_bal = df.get('LIMIT_BAL', 1)
            dti = (avg_bill / limit_bal.replace(0, 1)).clip(0, 2)
            return dti
        return pd.Series([0.5] * len(df))
    
    @staticmethod
    def _calculate_payment_rate_uci(df: pd.DataFrame) -> pd.Series:
        """Calculate payment response rate from UCI data"""
        pay_amt_cols = [col for col in df.columns if 'PAY_AMT' in col]
        bill_amt_cols = [col for col in df.columns if 'BILL_AMT' in col]
        
        if pay_amt_cols and bill_amt_cols:
            total_paid = df[pay_amt_cols].sum(axis=1)
            total_billed = df[bill_amt_cols].sum(axis=1)
            rate = (total_paid / total_billed.replace(0, 1)).clip(0, 1)
            return rate
        
        return pd.Series([0.5] * len(df))
    
    @staticmethod
    def _calculate_partial_payment_uci(df: pd.DataFrame) -> pd.Series:
        """Calculate partial payment score from UCI data"""
        pay_amt_cols = [col for col in df.columns if 'PAY_AMT' in col]
        
        if pay_amt_cols:
            # Count months with partial payments
            partial_payments = (df[pay_amt_cols] > 0).sum(axis=1) / len(pay_amt_cols)
            return partial_payments
        
        return pd.Series([0.3] * len(df))
    
    @staticmethod
    def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Add additional derived features
        
        Args:
            df: DataFrame with base features
            
        Returns:
            DataFrame with additional derived features
        """
        logger.info("Adding derived features...")
        
        # Payment consistency score
        if 'response_rate' in df.columns and 'partial_payment_history' in df.columns:
            df['payment_consistency'] = (df['response_rate'] + df['partial_payment_history']) / 2
        
        # Debt aging category (0=new, 1=moderate, 2=old)
        if 'days_past_due' in df.columns:
            df['debt_aging_category'] = pd.cut(
                df['days_past_due'],
                bins=[-1, 30, 90, 1000],
                labels=[0, 1, 2]
            ).astype(int)
        
        # Risk trend indicator
        if 'previous_defaults' in df.columns and 'debt_to_income_ratio' in df.columns:
            df['risk_trend'] = (
                df['previous_defaults'] * 0.5 + 
                df['debt_to_income_ratio'] * 0.5
            )
        
        logger.info(f"Added derived features. Total features: {len(df.columns)}")
        
        return df
