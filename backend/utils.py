import logging
import os

# Custom validation exception
class ValidationError(Exception):
    """Exception raised for errors in input validation."""
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def setup_logging():
    """Configure structured logging for the application."""
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)
    
    logging.basicConfig(
        level=log_level,
        format="[%(asctime)s] %(levelname)s in %(module)s (Line %(lineno)d): %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    logger = logging.getLogger("real_estate_analyzer")
    return logger


# Initialize logger
logger = setup_logging()


def validate_prediction_input(data):
    """
    Validates input data for price prediction.
    Expected schema:
    - Area: float/int, > 0
    - Bedrooms: int, > 0
    - Bathrooms: float/int, > 0
    - Parking: int, >= 0
    - Age: int, >= 0
    - LocationScore: float, 1.0 to 10.0
    - MetroDistance: float, >= 0
    - SchoolDistance: float, >= 0
    - HospitalDistance: float, >= 0
    - CrimeRate: float, >= 0
    - PopulationDensity: int, >= 0
    - City: str, one of the registered cities
    - Locality: str, one of the registered localities
    - PropertyType: str, one of the registered types
    - Furnishing: str, one of the registered states
    """
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object.")

    # Convert snake_case or lowercase keys if sent by older UI schemas
    mapped_data = {}
    key_mapping = {
        "area_sqft": "Area", "Area": "Area",
        "bedrooms": "Bedrooms", "Bedrooms": "Bedrooms",
        "bathrooms": "Bathrooms", "Bathrooms": "Bathrooms",
        "parking": "Parking", "Parking": "Parking",
        "age": "Age", "Age": "Age", "year_built": "Age",
        "location_score": "LocationScore", "LocationScore": "LocationScore",
        "metro_distance": "MetroDistance", "MetroDistance": "MetroDistance",
        "school_distance": "SchoolDistance", "SchoolDistance": "SchoolDistance",
        "hospital_distance": "HospitalDistance", "HospitalDistance": "HospitalDistance",
        "crime_rate": "CrimeRate", "CrimeRate": "CrimeRate",
        "population_density": "PopulationDensity", "PopulationDensity": "PopulationDensity",
        "city": "City", "City": "City",
        "locality": "Locality", "Locality": "Locality", "location": "Locality",
        "property_type": "PropertyType", "PropertyType": "PropertyType",
        "furnishing": "Furnishing", "Furnishing": "Furnishing"
    }

    for k, v in data.items():
        if k in key_mapping:
            mapped_data[key_mapping[k]] = v

    # Default missing fields logically if missing
    defaults = {
        "Area": 1850,
        "Bedrooms": 3,
        "Bathrooms": 2.0,
        "Parking": 1,
        "Age": 10,
        "LocationScore": 7.5,
        "MetroDistance": 2.5,
        "SchoolDistance": 1.5,
        "HospitalDistance": 3.0,
        "CrimeRate": 1.2,
        "PopulationDensity": 4500,
        "City": "Chicago",
        "Locality": "Downtown",
        "PropertyType": "Apartment",
        "Furnishing": "Semi-Furnished"
    }

    for key, val in defaults.items():
        if key not in mapped_data or mapped_data[key] is None:
            mapped_data[key] = val

    # Validate physical parameters
    try:
        area = float(mapped_data["Area"])
        if area <= 0:
            raise ValidationError("Area must be a positive number.")
    except (ValueError, TypeError):
        raise ValidationError("Area must be a valid number.")

    try:
        bedrooms = int(mapped_data["Bedrooms"])
        if bedrooms <= 0:
            raise ValidationError("Bedrooms must be a positive integer.")
    except (ValueError, TypeError):
        raise ValidationError("Bedrooms must be a valid integer.")

    try:
        bathrooms = float(mapped_data["Bathrooms"])
        if bathrooms <= 0:
            raise ValidationError("Bathrooms must be a positive number.")
    except (ValueError, TypeError):
        raise ValidationError("Bathrooms must be a valid number.")

    try:
        parking = int(mapped_data["Parking"])
        if parking < 0:
            raise ValidationError("Parking slot count cannot be negative.")
    except (ValueError, TypeError):
        raise ValidationError("Parking count must be a valid integer.")

    try:
        age_val = mapped_data["Age"]
        # If input was year_built (e.g. 2015), convert to Age (2026 - 2015)
        if age_val > 1800:
            age = max(0, 2026 - int(age_val))
        else:
            age = max(0, int(age_val))
    except (ValueError, TypeError):
        raise ValidationError("Age must be a valid integer.")

    try:
        location_score = float(mapped_data["LocationScore"])
        if location_score < 1.0 or location_score > 10.0:
            raise ValidationError("LocationScore must be between 1.0 and 10.0.")
    except (ValueError, TypeError):
        raise ValidationError("LocationScore must be a valid number.")

    try:
        metro = float(mapped_data["MetroDistance"])
        if metro < 0:
            raise ValidationError("MetroDistance cannot be negative.")
    except (ValueError, TypeError):
        raise ValidationError("MetroDistance must be a valid number.")

    try:
        school = float(mapped_data["SchoolDistance"])
        if school < 0:
            raise ValidationError("SchoolDistance cannot be negative.")
    except (ValueError, TypeError):
        raise ValidationError("SchoolDistance must be a valid number.")

    try:
        hospital = float(mapped_data["HospitalDistance"])
        if hospital < 0:
            raise ValidationError("HospitalDistance cannot be negative.")
    except (ValueError, TypeError):
        raise ValidationError("HospitalDistance must be a valid number.")

    try:
        crime = float(mapped_data["CrimeRate"])
        if crime < 0:
            raise ValidationError("CrimeRate cannot be negative.")
    except (ValueError, TypeError):
        raise ValidationError("CrimeRate must be a valid number.")

    try:
        pop = int(mapped_data["PopulationDensity"])
        if pop < 0:
            raise ValidationError("PopulationDensity cannot be negative.")
    except (ValueError, TypeError):
        raise ValidationError("PopulationDensity must be a valid integer.")

    # Validate strings
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Miami"]
    localities = ["Downtown", "Suburbs", "Uptown", "Waterfront", "Westside", "Eastside"]
    types = ["Apartment", "Condo", "Single-Family", "Townhouse", "Penthouse"]
    furnishings = ["Unfurnished", "Semi-Furnished", "Fully Furnished"]

    city = str(mapped_data["City"]).strip()
    if city not in cities:
        city = cities[0] # Default fallback

    locality = str(mapped_data["Locality"]).strip()
    if locality not in localities:
        locality = localities[0]

    prop_type = str(mapped_data["PropertyType"]).strip()
    if prop_type not in types:
        prop_type = types[0]

    furnishing = str(mapped_data["Furnishing"]).strip()
    if furnishing not in furnishings:
        furnishing = furnishings[0]

    return {
        "Area": area,
        "Bedrooms": bedrooms,
        "Bathrooms": bathrooms,
        "Parking": parking,
        "Age": age,
        "LocationScore": location_score,
        "MetroDistance": metro,
        "SchoolDistance": school,
        "HospitalDistance": hospital,
        "CrimeRate": crime,
        "PopulationDensity": pop,
        "City": city,
        "Locality": locality,
        "PropertyType": prop_type,
        "Furnishing": furnishing
    }


def validate_investment_input(data):
    """
    Validates input data for investment analysis.
    """
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object.")

    required_fields = ["purchase_price", "monthly_rent", "down_payment_pct", "interest_rate_pct", "loan_term_years"]
    for field in required_fields:
        if field not in data:
            raise ValidationError(f"Missing required field: '{field}'")
        if data[field] is None:
            raise ValidationError(f"Field '{field}' cannot be null.")

    def to_positive_float(val, name):
        try:
            f_val = float(val)
            if f_val < 0:
                raise ValidationError(f"Field '{name}' cannot be negative.")
            return f_val
        except (ValueError, TypeError):
            raise ValidationError(f"Field '{name}' must be a valid number.")

    purchase_price = to_positive_float(data["purchase_price"], "purchase_price")
    if purchase_price == 0:
        raise ValidationError("Field 'purchase_price' must be greater than 0.")

    monthly_rent = to_positive_float(data["monthly_rent"], "monthly_rent")
    
    down_payment_pct = to_positive_float(data["down_payment_pct"], "down_payment_pct")
    if down_payment_pct > 100:
        raise ValidationError("Field 'down_payment_pct' cannot exceed 100.")

    interest_rate_pct = to_positive_float(data["interest_rate_pct"], "interest_rate_pct")
    
    try:
        loan_term_years = int(data["loan_term_years"])
        if loan_term_years <= 0 or loan_term_years > 50:
            raise ValidationError("Field 'loan_term_years' must be an integer between 1 and 50.")
    except (ValueError, TypeError):
        raise ValidationError("Field 'loan_term_years' must be a valid integer.")

    annual_appreciation_pct = to_positive_float(data.get("annual_appreciation_pct", 4.0), "annual_appreciation_pct")
    property_tax_rate_pct = to_positive_float(data.get("property_tax_rate_pct", 1.2), "property_tax_rate_pct")
    maintenance_rate_pct = to_positive_float(data.get("maintenance_rate_pct", 1.0), "maintenance_rate_pct")

    return {
        "purchase_price": purchase_price,
        "monthly_rent": monthly_rent,
        "down_payment_pct": down_payment_pct,
        "interest_rate_pct": interest_rate_pct,
        "loan_term_years": loan_term_years,
        "annual_appreciation_pct": annual_appreciation_pct,
        "property_tax_rate_pct": property_tax_rate_pct,
        "maintenance_rate_pct": maintenance_rate_pct
    }
