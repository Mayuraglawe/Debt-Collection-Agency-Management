"""
Main model training script
Trains Random Forest, XGBoost, and Gradient Boosting models as per roadmap
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import cross_val_score
import joblib
import json
from datetime import datetime
from pathlib import Path
import logging
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.utils.data_loader import DataLoader
from app.utils.feature_engineering import FeatureEngineer
from app.utils.preprocessor import DataPreprocessor, DataValidator
from app.training.model_evaluator import ModelEvaluator
from app.config import (
    MODEL_PATH, SCALER_PATH, METADATA_PATH,
    RANDOM_FOREST_PARAMS, XGBOOST_PARAMS, GRADIENT_BOOSTING_PARAMS,
    CV_FOLDS, MODEL_VERSION, MODELS_DIR
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_and_prepare_data(use_lending_club: bool = True, use_uci: bool = True, sample_size: int = None):
    """
    Load and prepare datasets for training
    
    Args:
        use_lending_club: Whether to use Lending Club dataset
        use_uci: Whether to use UCI dataset
        sample_size: Number of samples to use (None for all)
        
    Returns:
        Combined DataFrame with features
    """
    logger.info("="*60)
    logger.info("LOADING AND PREPARING DATA")
    logger.info("="*60)
    
    datasets = []
    
    # Load Lending Club (primary dataset)
    if use_lending_club:
        try:
            logger.info("\n📊 Loading Lending Club dataset...")
            lc_df = DataLoader.load_lending_club(nrows=sample_size, sample_frac=0.1)
            lc_df = DataLoader.clean_data(lc_df)
            lc_df = DataLoader.handle_missing_values(lc_df)
            
            logger.info("🔧 Engineering features from Lending Club...")
            lc_features = FeatureEngineer.create_lending_club_features(lc_df)
            lc_features = FeatureEngineer.add_derived_features(lc_features)
            
            datasets.append(lc_features)
            logger.info(f"✅ Lending Club: {len(lc_features)} records prepared")
            
        except Exception as e:
            logger.error(f"❌ Error loading Lending Club: {e}")
    
    # Load UCI Credit Card (supplementary dataset)
    if use_uci:
        try:
            logger.info("\n📊 Loading UCI Credit Card dataset...")
            uci_df = DataLoader.load_uci_credit_card()
            uci_df = DataLoader.clean_data(uci_df)
            uci_df = DataLoader.handle_missing_values(uci_df)
            
            logger.info("🔧 Engineering features from UCI...")
            uci_features = FeatureEngineer.create_uci_features(uci_df)
            uci_features = FeatureEngineer.add_derived_features(uci_features)
            
            datasets.append(uci_features)
            logger.info(f"✅ UCI: {len(uci_features)} records prepared")
            
        except Exception as e:
            logger.error(f"❌ Error loading UCI: {e}")
    
    # Combine datasets
    if not datasets:
        raise ValueError("No datasets were loaded successfully")
    
    combined_df = pd.concat(datasets, ignore_index=True)
    logger.info(f"\n✅ Combined dataset: {len(combined_df)} total records")
    
    # Remove rows with NaN target
    combined_df = combined_df.dropna(subset=['recovered'])
    logger.info(f"✅ After removing NaN targets: {len(combined_df)} records")
    
    return combined_df


def train_models(X_train, X_test, y_train, y_test, feature_names):
    """
    Train all three models as per roadmap: Random Forest, XGBoost, Gradient Boosting
    
    Args:
        X_train: Training features
        X_test: Test features
        y_train: Training target
        y_test: Test target
        feature_names: List of feature names
        
    Returns:
        Dictionary with trained models and results
    """
    logger.info("\n" + "="*60)
    logger.info("TRAINING MODELS")
    logger.info("="*60)
    
    models = {}
    results = []
    
    # 1. Random Forest
    logger.info("\n🌲 Training Random Forest...")
    rf_model = RandomForestClassifier(**RANDOM_FOREST_PARAMS)
    rf_model.fit(X_train, y_train)
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X_train, y_train, cv=CV_FOLDS, scoring='roc_auc')
    logger.info(f"   Cross-validation ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # Evaluate
    rf_results = ModelEvaluator.evaluate_model(rf_model, X_test, y_test, "Random Forest")
    rf_results['cv_scores'] = cv_scores.tolist()
    results.append(rf_results)
    models['random_forest'] = rf_model
    
    # 2. XGBoost
    logger.info("\n🚀 Training XGBoost...")
    xgb_model = XGBClassifier(**XGBOOST_PARAMS)
    xgb_model.fit(X_train, y_train)
    
    # Cross-validation
    cv_scores = cross_val_score(xgb_model, X_train, y_train, cv=CV_FOLDS, scoring='roc_auc')
    logger.info(f"   Cross-validation ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # Evaluate
    xgb_results = ModelEvaluator.evaluate_model(xgb_model, X_test, y_test, "XGBoost")
    xgb_results['cv_scores'] = cv_scores.tolist()
    results.append(xgb_results)
    models['xgboost'] = xgb_model
    
    # 3. Gradient Boosting
    logger.info("\n📈 Training Gradient Boosting...")
    gb_model = GradientBoostingClassifier(**GRADIENT_BOOSTING_PARAMS)
    gb_model.fit(X_train, y_train)
    
    # Cross-validation
    cv_scores = cross_val_score(gb_model, X_train, y_train, cv=CV_FOLDS, scoring='roc_auc')
    logger.info(f"   Cross-validation ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # Evaluate
    gb_results = ModelEvaluator.evaluate_model(gb_model, X_test, y_test, "Gradient Boosting")
    gb_results['cv_scores'] = cv_scores.tolist()
    results.append(gb_results)
    models['gradient_boosting'] = gb_model
    
    # Compare models
    comparison = ModelEvaluator.compare_models(results)
    
    # Select best model based on ROC-AUC
    best_model_name = comparison.loc[comparison['ROC-AUC'].idxmax(), 'Model']
    best_model_key = {
        'Random Forest': 'random_forest',
        'XGBoost': 'xgboost',
        'Gradient Boosting': 'gradient_boosting'
    }[best_model_name]
    
    best_model = models[best_model_key]
    best_results = [r for r in results if r['model_name'] == best_model_name][0]
    
    # Feature importance
    feature_importance = ModelEvaluator.get_feature_importance(best_model, feature_names)
    
    return {
        'best_model': best_model,
        'best_model_name': best_model_name,
        'best_results': best_results,
        'all_results': results,
        'comparison': comparison,
        'feature_importance': feature_importance
    }


def save_model_artifacts(model, preprocessor, results, feature_names):
    """
    Save model, scaler, and metadata
    
    Args:
        model: Trained model
        preprocessor: Fitted preprocessor
        results: Training results
        feature_names: List of feature names
    """
    logger.info("\n" + "="*60)
    logger.info("SAVING MODEL ARTIFACTS")
    logger.info("="*60)
    
    # Create models directory if it doesn't exist
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save model
    joblib.dump(model, MODEL_PATH)
    logger.info(f"✅ Saved model to {MODEL_PATH}")
    
    # Save preprocessor (includes scaler)
    preprocessor.save(SCALER_PATH)
    logger.info(f"✅ Saved preprocessor to {SCALER_PATH}")
    
    # Save metadata
    metadata = {
        'model_version': MODEL_VERSION,
        'model_name': results['best_model_name'],
        'training_date': datetime.now().isoformat(),
        'metrics': {
            'accuracy': results['best_results']['accuracy'],
            'roc_auc': results['best_results']['roc_auc'],
            'f1_score': results['best_results']['f1_score'],
            'cv_scores_mean': np.mean(results['best_results']['cv_scores']),
            'cv_scores_std': np.std(results['best_results']['cv_scores'])
        },
        'feature_names': feature_names,
        'num_features': len(feature_names),
        'confusion_matrix': results['best_results']['confusion_matrix'],
        'classification_report': results['best_results']['classification_report']
    }
    
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"✅ Saved metadata to {METADATA_PATH}")
    
    logger.info("\n🎉 All artifacts saved successfully!")


def main():
    """Main training pipeline"""
    logger.info("\n" + "="*80)
    logger.info("ATLAS DCA - ML MODEL TRAINING PIPELINE")
    logger.info("="*80)
    
    try:
        # 1. Load and prepare data
        df = load_and_prepare_data(use_lending_club=True, use_uci=True)
        
        # 2. Validate data
        logger.info("\n🔍 Validating data...")
        DataValidator.validate_data_types(df)
        DataValidator.validate_ranges(df)
        balance_info = DataValidator.check_class_balance(df['recovered'])
        
        # 3. Preprocess data
        logger.info("\n⚙️ Preprocessing data...")
        preprocessor = DataPreprocessor()
        X, y = preprocessor.fit_transform(df, target_col='recovered')
        
        # 4. Split data
        X_train, X_test, y_train, y_test = preprocessor.split_data(X, y)
        
        # 5. Train models
        training_results = train_models(X_train, X_test, y_train, y_test, preprocessor.feature_names)
        
        # 6. Save artifacts
        save_model_artifacts(
            training_results['best_model'],
            preprocessor,
            training_results,
            preprocessor.feature_names
        )
        
        # 7. Final summary
        logger.info("\n" + "="*80)
        logger.info("TRAINING COMPLETE!")
        logger.info("="*80)
        logger.info(f"🏆 Best Model: {training_results['best_model_name']}")
        logger.info(f"📊 ROC-AUC: {training_results['best_results']['roc_auc']:.4f}")
        logger.info(f"🎯 Accuracy: {training_results['best_results']['accuracy']:.4f}")
        logger.info(f"📈 F1 Score: {training_results['best_results']['f1_score']:.4f}")
        logger.info("="*80)
        
        return training_results
        
    except Exception as e:
        logger.error(f"\n❌ Training failed: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()
