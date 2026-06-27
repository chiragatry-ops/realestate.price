import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

# Set seed for reproducibility
np.random.seed(42)

CITIES = ["New York", "Los Angeles", "Chicago", "Houston", "Miami"]
LOCALITIES = ["Downtown", "Suburbs", "Uptown", "Waterfront", "Westside", "Eastside"]
PROPERTY_TYPES = ["Apartment", "Condo", "Single-Family", "Townhouse", "Penthouse"]
FURNISHING_STATUS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"]

# Base pricing parameters for realistic generation
CITY_MULTIPLIERS = {
    "New York": 1.6,
    "Los Angeles": 1.4,
    "Chicago": 1.0,
    "Houston": 0.85,
    "Miami": 1.2
}

LOCALITY_MULTIPLIERS = {
    "Downtown": 1.4,
    "Suburbs": 0.8,
    "Uptown": 1.2,
    "Waterfront": 1.8,
    "Westside": 1.1,
    "Eastside": 0.9
}

PROPERTY_MULTIPLIERS = {
    "Apartment": 0.9,
    "Condo": 1.0,
    "Single-Family": 1.3,
    "Townhouse": 1.1,
    "Penthouse": 1.7
}

FURNISHING_MULTIPLIERS = {
    "Unfurnished": 1.0,
    "Semi-Furnished": 1.05,
    "Fully Furnished": 1.15
}


def generate_synthetic_dataset(filepath="backend/housing.csv", num_records=5000):
    """
    Generates a highly realistic housing dataset with 5,000 rows.
    """
    print(f"Generating synthetic housing dataset with {num_records} records...")
    
    # Feature 1: Area (Sqft)
    area = np.random.normal(2100, 800, num_records)
    area = np.clip(area, 500, 8000).astype(int)
    
    # Feature 2: Bedrooms
    bedrooms = np.round(area / 650 + np.random.normal(0.4, 0.5, num_records))
    bedrooms = np.clip(bedrooms, 1, 6).astype(int)
    
    # Feature 3: Bathrooms
    bathrooms = np.round((bedrooms * 0.75) + np.random.normal(0, 0.4, num_records) * 2) / 2
    bathrooms = np.clip(bathrooms, 1.0, 5.0)
    
    # Feature 4: Parking slots
    parking = np.random.choice([0, 1, 2, 3], num_records, p=[0.2, 0.5, 0.25, 0.05])
    
    # Feature 5: Age (Years)
    age = np.random.randint(0, 80, num_records)
    
    # Feature 6: LocationScore (1 to 10 scale)
    location_score = np.random.uniform(2.0, 10.0, num_records)
    
    # Feature 7-9: Distances (km)
    metro_distance = np.random.exponential(3.5, num_records)
    metro_distance = np.clip(metro_distance, 0.1, 25.0)
    
    school_distance = np.random.uniform(0.2, 8.0, num_records)
    hospital_distance = np.random.uniform(0.5, 12.0, num_records)
    
    # Feature 10: CrimeRate (0 to 10 scale)
    crime_rate = np.random.exponential(1.5, num_records)
    crime_rate = np.clip(crime_rate, 0.0, 10.0)
    
    # Feature 11: PopulationDensity (people per sq km)
    population_density = np.random.normal(4500, 2000, num_records)
    population_density = np.clip(population_density, 300, 15000).astype(int)
    
    # Categoricals
    city = np.random.choice(CITIES, num_records)
    locality = np.random.choice(LOCALITIES, num_records)
    prop_type = np.random.choice(PROPERTY_TYPES, num_records)
    furnishing = np.random.choice(FURNISHING_STATUS, num_records)
    
    # Create DataFrame
    df = pd.DataFrame({
        "Area": area,
        "Bedrooms": bedrooms,
        "Bathrooms": bathrooms,
        "Parking": parking,
        "Age": age,
        "LocationScore": location_score,
        "MetroDistance": metro_distance,
        "SchoolDistance": school_distance,
        "HospitalDistance": hospital_distance,
        "CrimeRate": crime_rate,
        "PopulationDensity": population_density,
        "City": city,
        "Locality": locality,
        "PropertyType": prop_type,
        "Furnishing": furnishing
    })
    
    # Calculate realistic housing target price (correlation + multipliers + noise)
    base_price = 100000.0
    area_contrib = df["Area"] * 165.0
    bedroom_contrib = df["Bedrooms"] * 24000.0
    bathroom_contrib = df["Bathrooms"] * 18000.0
    parking_contrib = df["Parking"] * 12000.0
    
    # Location modifiers
    loc_score_bonus = (df["LocationScore"] - 5.0) * 0.08 # +/- 40% based on score
    distance_penalty = -0.015 * df["MetroDistance"] - 0.005 * df["SchoolDistance"] # lower price if far from transit
    crime_penalty = -0.04 * df["CrimeRate"]
    
    age_penalty = df["Age"].apply(lambda x: -0.006 * x if x < 40 else -0.24 + (x - 40) * 0.001)
    
    subtotal = base_price + area_contrib + bedroom_contrib + bathroom_contrib + parking_contrib
    
    # Apply category multipliers
    city_mult = df["City"].map(CITY_MULTIPLIERS)
    locality_mult = df["Locality"].map(LOCALITY_MULTIPLIERS)
    prop_mult = df["PropertyType"].map(PROPERTY_MULTIPLIERS)
    furnishing_mult = df["Furnishing"].map(FURNISHING_MULTIPLIERS)
    
    price_factor = (1.0 + loc_score_bonus + distance_penalty + crime_penalty + age_penalty)
    # Ensure factor doesn't drop below 0.35 to avoid negative/trivial prices
    price_factor = np.clip(price_factor, 0.35, 3.5)
    
    final_price = subtotal * price_factor * city_mult * locality_mult * prop_mult * furnishing_mult
    
    # Add gaussian market noise (+/- 12% standard deviation)
    noise = np.random.normal(1.0, 0.08, num_records)
    final_price = final_price * noise
    
    df["Price"] = np.clip(final_price, 45000, None).round(-2)
    
    # Ensure directory exists and save
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Dataset saved successfully to {filepath}!")
    return df


def clean_data(df):
    """
    Cleans the input dataset. Handles outliers, caps negative metrics, 
    and fills nulls with median/modes if they exist.
    """
    cleaned_df = df.copy()
    
    # Handle missing values if any
    for col in cleaned_df.columns:
        if cleaned_df[col].isnull().sum() > 0:
            if cleaned_df[col].dtype in ['int64', 'float64']:
                cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].median())
            else:
                cleaned_df[col] = cleaned_df[col].fillna(cleaned_df[col].mode()[0])
                
    # Handle anomalies / limit physical ranges
    cleaned_df["Area"] = np.clip(cleaned_df["Area"], 200, 15000)
    cleaned_df["Bedrooms"] = np.clip(cleaned_df["Bedrooms"], 1, 10)
    cleaned_df["Bathrooms"] = np.clip(cleaned_df["Bathrooms"], 1.0, 8.0)
    cleaned_df["Parking"] = np.clip(cleaned_df["Parking"], 0, 5)
    cleaned_df["Age"] = np.clip(cleaned_df["Age"], 0, 120)
    cleaned_df["LocationScore"] = np.clip(cleaned_df["LocationScore"], 1.0, 10.0)
    cleaned_df["MetroDistance"] = np.clip(cleaned_df["MetroDistance"], 0.05, 50.0)
    cleaned_df["CrimeRate"] = np.clip(cleaned_df["CrimeRate"], 0.0, 10.0)
    
    return cleaned_df


class RealEstateFeaturePipeline:
    """
    Handles robust encoding, scaling, and feature engineering.
    Can be fitted on training data and saved for runtime transformations.
    """
    def __init__(self):
        self.scaler = StandardScaler()
        self.categorical_columns = ["City", "Locality", "PropertyType", "Furnishing"]
        self.numerical_columns = [
            "Area", "Bedrooms", "Bathrooms", "Parking", "Age", "LocationScore",
            "MetroDistance", "SchoolDistance", "HospitalDistance", "CrimeRate",
            "PopulationDensity", "ConvenienceScore", "TransitProximityIndex"
        ]
        self.columns_list = None
        self.fitted = False

    def engineer_features(self, df):
        """
        Creates custom composite metrics representing financial and spatial characteristics.
        """
        engineered = df.copy()
        
        # 1. Convenience Score: Higher is better. Weighted blend of nearby amenities
        engineered["ConvenienceScore"] = 10.0 - (
            engineered["SchoolDistance"] * 0.4 + 
            engineered["HospitalDistance"] * 0.3 + 
            engineered["MetroDistance"] * 0.3
        )
        engineered["ConvenienceScore"] = np.clip(engineered["ConvenienceScore"], 0.5, 10.0)
        
        # 2. Transit Proximity Index: Exponential decay based on distance to transit
        engineered["TransitProximityIndex"] = np.exp(-0.25 * engineered["MetroDistance"]) * 10.0
        
        return engineered

    def fit_transform(self, df):
        """
        Fits the preprocessors on the raw dataset and applies transformation.
        """
        # Step 1: Feature engineering
        engineered_df = self.engineer_features(df)
        
        # Step 2: One-Hot encode categoricals manually to guarantee predictable features
        encoded_df = pd.get_dummies(
            engineered_df, 
            columns=self.categorical_columns, 
            drop_first=False,
            dtype=float
        )
        
        # Ensure we capture and save the list of final columns (excluding target variable)
        target_col = "Price"
        feature_cols = [col for col in encoded_df.columns if col != target_col]
        self.columns_list = feature_cols
        
        # Step 3: Fit & Scale numerical columns
        encoded_df[self.numerical_columns] = self.scaler.fit_transform(encoded_df[self.numerical_columns])
        
        self.fitted = True
        return encoded_df[feature_cols], encoded_df[target_col]

    def transform(self, df):
        """
        Transforms a raw property dictionary or DataFrame for inference using the fitted schema.
        """
        if not self.fitted:
            raise ValueError("Feature Pipeline has not been fitted yet!")
            
        # Step 1: Feature engineering
        engineered_df = self.engineer_features(df)
        
        # Step 2: One-Hot encode categoricals
        encoded_df = pd.get_dummies(
            engineered_df, 
            columns=self.categorical_columns, 
            drop_first=False,
            dtype=float
        )
        
        # Align columns with the fitted columns list to prevent mismatched inputs
        for col in self.columns_list:
            if col not in encoded_df.columns:
                encoded_df[col] = 0.0 # Fill missing one-hot dummies
                
        # Re-order and select exact columns
        aligned_df = encoded_df[self.columns_list].copy()
        
        # Step 3: Scale numerical columns
        aligned_df[self.numerical_columns] = self.scaler.transform(aligned_df[self.numerical_columns])
        
        return aligned_df


if __name__ == "__main__":
    # Self-test dataset creation & pipeline transform
    df = generate_synthetic_dataset("backend/housing.csv", 100)
    df_clean = clean_data(df)
    pipeline = RealEstateFeaturePipeline()
    X, y = pipeline.fit_transform(df_clean)
    print(f"Sample pipeline test succeeded! Feature shape: {X.shape}")
