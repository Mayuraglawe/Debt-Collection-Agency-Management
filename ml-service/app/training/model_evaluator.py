"""
Model evaluation utilities
"""
import numpy as np
import pandas as pd
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    roc_auc_score, 
    roc_curve,
    precision_recall_curve,
    f1_score,
    accuracy_score
)
from typing import Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelEvaluator:
    """Evaluate ML model performance"""
    
    @staticmethod
    def evaluate_model(model, X_test: pd.DataFrame, y_test: pd.Series, model_name: str = "Model") -> Dict[str, Any]:
        """
        Comprehensive model evaluation
        
        Args:
            model: Trained model
            X_test: Test features
            y_test: Test target
            model_name: Name of the model
            
        Returns:
            Dictionary with evaluation metrics
        """
        logger.info(f"Evaluating {model_name}...")
        
        # Predictions
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        metrics = {
            'model_name': model_name,
            'accuracy': accuracy_score(y_test, y_pred),
            'roc_auc': roc_auc_score(y_test, y_prob),
            'f1_score': f1_score(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
            'classification_report': classification_report(y_test, y_pred, output_dict=True)
        }
        
        # Log results
        logger.info(f"\n{model_name} Performance:")
        logger.info(f"  Accuracy: {metrics['accuracy']:.4f}")
        logger.info(f"  ROC-AUC: {metrics['roc_auc']:.4f}")
        logger.info(f"  F1 Score: {metrics['f1_score']:.4f}")
        logger.info(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
        logger.info(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
        
        return metrics
    
    @staticmethod
    def get_feature_importance(model, feature_names: list, top_n: int = 20) -> pd.DataFrame:
        """
        Get feature importance from model
        
        Args:
            model: Trained model
            feature_names: List of feature names
            top_n: Number of top features to return
            
        Returns:
            DataFrame with feature importance
        """
        try:
            if hasattr(model, 'feature_importances_'):
                importance = model.feature_importances_
            elif hasattr(model, 'coef_'):
                importance = np.abs(model.coef_[0])
            else:
                logger.warning("Model does not have feature importance")
                return pd.DataFrame()
            
            feature_importance = pd.DataFrame({
                'feature': feature_names,
                'importance': importance
            }).sort_values('importance', ascending=False)
            
            logger.info(f"\nTop {top_n} Important Features:")
            for idx, row in feature_importance.head(top_n).iterrows():
                logger.info(f"  {row['feature']}: {row['importance']:.4f}")
            
            return feature_importance.head(top_n)
            
        except Exception as e:
            logger.error(f"Error getting feature importance: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def compare_models(results: list) -> pd.DataFrame:
        """
        Compare multiple model results
        
        Args:
            results: List of evaluation result dictionaries
            
        Returns:
            DataFrame with model comparison
        """
        comparison = pd.DataFrame([
            {
                'Model': r['model_name'],
                'Accuracy': r['accuracy'],
                'ROC-AUC': r['roc_auc'],
                'F1 Score': r['f1_score'],
                'Precision': r['classification_report'].get('1', r['classification_report'].get('1.0', {})).get('precision', 0),
                'Recall': r['classification_report'].get('1', r['classification_report'].get('1.0', {})).get('recall', 0)
            }
            for r in results
        ])
        
        logger.info("\n" + "="*60)
        logger.info("MODEL COMPARISON")
        logger.info("="*60)
        logger.info(f"\n{comparison.to_string(index=False)}")
        logger.info("="*60)
        
        # Find best model
        best_model_idx = comparison['ROC-AUC'].idxmax()
        best_model = comparison.loc[best_model_idx, 'Model']
        best_auc = comparison.loc[best_model_idx, 'ROC-AUC']
        
        logger.info(f"\n🏆 BEST MODEL: {best_model} (ROC-AUC: {best_auc:.4f})")
        
        return comparison
    
    @staticmethod
    def calculate_business_metrics(y_test: pd.Series, y_pred: np.ndarray, y_prob: np.ndarray) -> Dict[str, float]:
        """
        Calculate business-relevant metrics
        
        Args:
            y_test: True labels
            y_pred: Predicted labels
            y_prob: Predicted probabilities
            
        Returns:
            Dictionary with business metrics
        """
        # Confusion matrix components
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        
        # Business metrics
        metrics = {
            'true_positives': int(tp),
            'false_positives': int(fp),
            'true_negatives': int(tn),
            'false_negatives': int(fn),
            'precision': tp / (tp + fp) if (tp + fp) > 0 else 0,
            'recall': tp / (tp + fn) if (tp + fn) > 0 else 0,
            'specificity': tn / (tn + fp) if (tn + fp) > 0 else 0,
            'false_positive_rate': fp / (fp + tn) if (fp + tn) > 0 else 0
        }
        
        logger.info("\nBusiness Metrics:")
        logger.info(f"  True Positives (Correctly predicted recoveries): {metrics['true_positives']}")
        logger.info(f"  False Positives (Predicted recovery but didn't): {metrics['false_positives']}")
        logger.info(f"  True Negatives (Correctly predicted non-recovery): {metrics['true_negatives']}")
        logger.info(f"  False Negatives (Predicted non-recovery but did): {metrics['false_negatives']}")
        logger.info(f"  Precision: {metrics['precision']:.4f}")
        logger.info(f"  Recall: {metrics['recall']:.4f}")
        
        return metrics
