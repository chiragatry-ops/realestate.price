import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.model import RealEstateModelManager
from backend.utils import validate_prediction_input, ValidationError, logger

# Instantiate model manager
model_manager = RealEstateModelManager()


def predict_property_price(input_data):
    """
    Validates input data, calculates price using ML model, and returns comprehensive insights.
    """
    try:
        validated_data = validate_prediction_input(input_data)
        logger.info(f"Initiating evaluation for property profile: {validated_data}")
        
        price, is_fallback = model_manager.predict_price(validated_data)
        
        # Calculate statistical confidence margins
        margin_pct = 0.08 if not is_fallback else 0.14
        lower_bound = price * (1.0 - margin_pct)
        upper_bound = price * (1.0 + margin_pct)
        
        # Build composite output schema
        return {
            "prediction": {
                "estimated_price": float(round(price, 2)),
                "price_lower_bound": float(round(lower_bound, 2)),
                "price_upper_bound": float(round(upper_bound, 2)),
                "confidence_margin_pct": margin_pct * 100,
                "is_ml_prediction": not is_fallback
            },
            "property_profile": validated_data,
            "market_insights": {
                "price_per_sqft": float(round(price / validated_data["Area"], 2)),
                "location_tier": "Premium" if validated_data["Locality"] in ["Waterfront", "Downtown", "Uptown"] else "Standard",
                "estimated_monthly_rent": float(round(price * 0.0055, 2))
            }
        }
        
    except ValidationError as ve:
        logger.error(f"Validation failure in predict_property_price pipeline: {ve.message}")
        raise
    except Exception as e:
        logger.exception(f"Unhandled error in prediction workflow: {e}")
        raise Exception(f"Failed to generate price prediction: {e}")


if __name__ == "__main__":
    # Test script directly
    test_input = {
        "Area": 1850,
        "Bedrooms": 3,
        "Bathrooms": 2.5,
        "Parking": 2,
        "Age": 8,
        "LocationScore": 8.2,
        "MetroDistance": 1.2,
        "SchoolDistance": 0.5,
        "HospitalDistance": 2.1,
        "CrimeRate": 0.4,
        "PopulationDensity": 3200,
        "City": "Los Angeles",
        "Locality": "Waterfront",
        "PropertyType": "Condo",
        "Furnishing": "Fully Furnished"
    }
    
    print("Testing prediction script directly...")
    try:
        res = predict_property_price(test_input)
        print("\nPrediction Output:")
        print(f"Price: ${res['prediction']['estimated_price']:,.2f}")
        print(f"Range: ${res['prediction']['price_lower_bound']:,.2f} - ${res['prediction']['price_upper_bound']:,.2f}")
    except Exception as e:
        print(f"Failed: {e}")
