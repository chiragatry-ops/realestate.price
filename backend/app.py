import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add parent directory to path to support executing from package root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.utils import logger, ValidationError, validate_prediction_input, validate_investment_input
from backend.predict import predict_property_price, model_manager
from backend.investment import analyze_investment
from backend.train_model import train_and_evaluate, MODEL_PATH

# Initialize Flask App
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for production/development
CORS(app, resources={r"/*": {"origins": "*"}})


@app.errorhandler(ValidationError)
def handle_validation_error(error):
    """Exception handler for invalid user inputs."""
    logger.warning(f"Bad request received: {error.message}")
    response = jsonify({
        "success": False,
        "error": "Validation Error",
        "message": error.message
    })
    response.status_code = 400
    return response


@app.errorhandler(Exception)
def handle_general_exception(error):
    """Catch-all handler for unhandled exceptions in the application."""
    logger.exception(f"Unhandled server error: {str(error)}")
    response = jsonify({
        "success": False,
        "error": "Internal Server Error",
        "message": "An unexpected error occurred. Please try again later."
    })
    response.status_code = 500
    return response


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "Real Estate Price Prediction API is running!",
        "health": "/health",
        "predict": "/predict",
        "investment": "/investment",
        "metrics": "/metrics"
    }), 200    


@app.route("/health", methods=["GET"])
def health_check():
    """
    GET /health
    Verifies that the API service is alive and the ML model is operational.
    """
    model_status = "unloaded"
    is_ml_ready = False
    
    if model_manager.model is not None:
        model_status = "loaded"
        is_ml_ready = True
    elif os.path.exists(MODEL_PATH):
        model_status = "available_on_disk"
        
    logger.info("Health check endpoint hit.")
    return jsonify({
        "status": "healthy",
        "service": "Real Estate Price Prediction and Investment Analyzer API",
        "model_status": model_status,
        "is_ml_prediction_ready": is_ml_ready,
        "version": "1.0.0"
    }), 200


@app.route("/predict", methods=["POST"])
def api_predict():
    """
    POST /predict
    Accepts JSON property profiles, runs the model, and returns predicted market values.
    """
    data = request.get_json() or {}
    logger.info("Received request for property price prediction.")
    
    # Predict price
    result = predict_property_price(data)
    
    return jsonify({
        "success": True,
        "data": result
    }), 200


@app.route("/investment", methods=["POST"])
def api_investment():
    """
    POST /investment
    Calculates detailed financial investment analysis, cash flow, ROI, and mortgage projections.
    """
    data = request.get_json() or {}
    logger.info("Received request for real estate investment analysis.")
    
    # Validate investment input
    validated_params = validate_investment_input(data)
    
    # Perform financial analysis
    analysis_result = analyze_investment(validated_params)
    
    return jsonify({
        "success": True,
        "data": analysis_result
    }), 200


@app.route("/metrics", methods=["GET"])
def api_metrics():
    """
    GET /metrics
    Returns performance metrics of the trained GradientBoostingRegressor model.
    """
    logger.info("Received request for model performance metrics.")
    
    # If the model is not trained/loaded yet, try loading it
    if model_manager.model is None:
        model_manager.load_model()
        
    metadata = model_manager.model_metadata
    
    return jsonify({
        "success": True,
        "metrics": {
            "algorithm": "Gradient Boosting Regressor (Scikit-Learn)",
            "is_trained": metadata.get("is_trained", False),
            "r2_score": metadata.get("r2_score", 0.0),
            "mean_squared_error_rmse": metadata.get("mean_squared_error", 0.0),
            "feature_names": metadata.get("feature_names", []),
            "feature_importances": metadata.get("feature_importances", {})
        }
    }), 200


@app.route("/train", methods=["POST"])
def api_train():
    """
    POST /train (Bonus admin endpoint)
    Triggers re-training of the Gradient Boosting model on refreshed synthetic data.
    """
    logger.info("Received manual trigger to re-train the ML model.")
    train_results = train_and_evaluate()
    
    # Reload model
    model_manager.load_model()
    
    if train_results["success"]:
        return jsonify({
            "success": True,
            "message": "Model successfully retrained and deployed.",
            "metrics": train_results["metrics"]
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Model training completed but failed to save/deploy."
        }), 500


# Fallback for older before_first_request deprecation or if using WSGI
# This ensures training is evaluated if run in python directly
if not os.path.exists(MODEL_PATH):
    try:
        logger.info("Initializing pre-flight training of the ML model...")
        train_and_evaluate()
        model_manager.load_model()
    except Exception as _e:
        logger.warning(f"Could not complete pre-flight training. Will use heuristic baseline: {_e}")


if __name__ == "__main__":
    # Standard run configuration for local development
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
