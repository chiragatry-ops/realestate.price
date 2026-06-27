import os
import sys
import joblib
import pandas as pd
import numpy as np

# Adjust package path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.utils import logger

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "real_estate_gb_model.joblib")


class RealEstateModelManager:
    """
    Manages loading, saving, and inference for the Real Estate Price Prediction Model.
    Utilizes GradientBoostingRegressor coupled with the Custom RealEstateFeaturePipeline.
    """
    def __init__(self):
        self.model = None
        self.pipeline = None
        self.model_metadata = {
            "r2_score": 0.0,
            "mean_squared_error": 0.0,
            "is_trained": False,
            "feature_importances": {}
        }
        self.load_model()

    def load_model(self):
        """
        Loads the trained model and feature pipeline from disk.
        """
        if os.path.exists(MODEL_PATH):
            try:
                saved_data = joblib.load(MODEL_PATH)
                self.model = saved_data.get("model")
                self.pipeline = saved_data.get("pipeline")
                self.model_metadata = saved_data.get("metadata", self.model_metadata)
                logger.info(f"ML Pipeline loaded successfully from {MODEL_PATH}")
            except Exception as e:
                logger.error(f"Error loading model artifacts: {e}")
                self.model = None
                self.pipeline = None
        else:
            logger.warning("No trained ML model joblib found on disk. Falling back to Heuristic Solver.")

    def predict_price(self, data):
        """
        Predicts price. If the ML pipeline is loaded, transforms the raw dict 
        and scores the model. Otherwise, runs a highly robust fallback heuristic.
        """
        if self.model is not None and self.pipeline is not None:
            try:
                # Wrap dict into a Single-Row DataFrame
                input_df = pd.DataFrame([data])
                
                # Transform using fitted pipeline
                transformed_df = self.pipeline.transform(input_df)
                
                # Predict
                pred = self.model.predict(transformed_df)
                price = float(pred[0])
                logger.info(f"Model prediction complete: ${price:,.2f} (ML pipeline)")
                return price, False # price, is_fallback
            except Exception as e:
                logger.error(f"Error during ML inference pipeline: {e}. Reverting to Heuristic.")
                
        # Heuristic calculation (Duplicate of training mathematical baseline)
        area = data["Area"]
        bedrooms = data["Bedrooms"]
        bathrooms = data["Bathrooms"]
        parking = data["Parking"]
        age = data["Age"]
        loc_score = data["LocationScore"]
        metro_dist = data["MetroDistance"]
        crime_rate = data["CrimeRate"]
        city = data["City"]
        locality = data["Locality"]
        prop_type = data["PropertyType"]
        furnishing = data["Furnishing"]
        
        # Base modifiers mirroring feature_engineering values
        city_mults = {"New York": 1.6, "Los Angeles": 1.4, "Chicago": 1.0, "Houston": 0.85, "Miami": 1.2}
        loc_mults = {"Downtown": 1.4, "Suburbs": 0.8, "Uptown": 1.2, "Waterfront": 1.8, "Westside": 1.1, "Eastside": 0.9}
        prop_mults = {"Apartment": 0.9, "Condo": 1.0, "Single-Family": 1.3, "Townhouse": 1.1, "Penthouse": 1.7}
        furnish_mults = {"Unfurnished": 1.0, "Semi-Furnished": 1.05, "Fully Furnished": 1.15}
        
        base_price = 100000.0
        area_contrib = area * 165.0
        bedroom_contrib = bedrooms * 24000.0
        bathroom_contrib = bathrooms * 18000.0
        parking_contrib = parking * 12000.0
        
        subtotal = base_price + area_contrib + bedroom_contrib + bathroom_contrib + parking_contrib
        
        loc_score_bonus = (loc_score - 5.0) * 0.08
        distance_penalty = -0.015 * metro_dist
        crime_penalty = -0.04 * crime_rate
        
        # Age depreciation curve
        age_penalty = -0.006 * age if age < 40 else -0.24 + (age - 40) * 0.001
        
        factor = np.clip(1.0 + loc_score_bonus + distance_penalty + crime_penalty + age_penalty, 0.35, 3.5)
        
        predicted = subtotal * factor * city_mults.get(city, 1.0) * loc_mults.get(locality, 1.0) * prop_mults.get(prop_type, 1.0) * furnish_mults.get(furnishing, 1.0)
        predicted = float(round(predicted / 100.0) * 100.0)
        
        logger.info(f"Fallback heuristic calculation complete: ${predicted:,.2f}")
        return predicted, True
