import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Ensure package paths align
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.feature_engineering import generate_synthetic_dataset, clean_data, RealEstateFeaturePipeline
from backend.utils import logger

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "real_estate_gb_model.joblib")
DATA_PATH = os.path.join(MODEL_DIR, "housing.csv")


def train_and_evaluate():
    """
    Complete ML training pipeline:
    1. Loads or generates a 5,000 record synthetic housing dataset
    2. Cleans the data
    3. Transforms, encodes, and scales features
    4. Trains GradientBoostingRegressor
    5. Evaluates model accuracy (MAE, RMSE, R2 Score)
    6. Persists the model and feature pipeline for online serving
    """
    logger.info("Initializing Real Estate Price Prediction Model training pipeline...")
    
    # 1. Dataset generation if missing
    if not os.path.exists(DATA_PATH):
        logger.info(f"housing.csv not found at {DATA_PATH}. Triggering 5,000 record generation...")
        df_raw = generate_synthetic_dataset(DATA_PATH, num_records=5000)
    else:
        logger.info(f"Loading existing housing.csv from {DATA_PATH}...")
        df_raw = pd.read_csv(DATA_PATH)
        
    logger.info(f"Dataset shape loaded: {df_raw.shape}")
    
    # 2. Data Cleaning
    logger.info("Cleaning outliers and handling missing values...")
    df_cleaned = clean_data(df_raw)
    
    # 3. Encoding & Feature Engineering Pipeline
    logger.info("Running feature engineering, encoding and standardization pipeline...")
    pipeline = RealEstateFeaturePipeline()
    X, y = pipeline.fit_transform(df_cleaned)
    
    # 4. Train-test Split
    logger.info("Splitting dataset into training and test arrays (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 5. Model Fit (Gradient Boosting Regressor)
    logger.info("Fitting GradientBoostingRegressor model with hyperparameter grid...")
    model = GradientBoostingRegressor(
        n_estimators=220,
        learning_rate=0.07,
        max_depth=5,
        min_samples_split=4,
        min_samples_leaf=2,
        subsample=0.85,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # 6. Model Evaluation
    logger.info("Running model predictions and evaluating metrics...")
    train_preds = model.predict(X_train)
    test_preds = model.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, train_preds)
    test_mae = mean_absolute_error(y_test, test_preds)
    
    train_rmse = np.sqrt(mean_squared_error(y_train, train_preds))
    test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
    
    train_r2 = r2_score(y_train, train_preds)
    test_r2 = r2_score(y_test, test_preds)
    
    logger.info("==========================================")
    logger.info(f"Model Training R²: {train_r2:.4f} | Testing R²: {test_r2:.4f}")
    logger.info(f"Model Training MAE: ${train_mae:,.2f} | Testing MAE: ${test_mae:,.2f}")
    logger.info(f"Model Training RMSE: ${train_rmse:,.2f} | Testing RMSE: ${test_rmse:,.2f}")
    logger.info("==========================================")
    
    # Feature Importances map
    importances = {name: float(imp) for name, imp in zip(pipeline.columns_list, model.feature_importances_)}
    
    # Create evaluation metrics structure
    metadata = {
        "is_trained": True,
        "r2_score": float(test_r2),
        "mean_absolute_error": float(test_mae),
        "mean_squared_error": float(test_rmse),
        "feature_importances": importances,
        "feature_names": pipeline.columns_list
    }
    
    # 7. Persist complete state
    logger.info(f"Saving Gradient Boosting model and scaler pipeline to {MODEL_PATH}...")
    try:
        joblib.dump({
            "model": model,
            "pipeline": pipeline,
            "metadata": metadata
        }, MODEL_PATH)
        logger.info("Successfully trained, evaluated, and saved pipeline artifacts!")
        return {
            "success": True,
            "metrics": metadata
        }
    except Exception as e:
        logger.error(f"Failed to save ML artifacts to disk: {e}")
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    train_and_evaluate()
