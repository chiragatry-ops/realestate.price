export interface PredictionInput {
  Area: number;
  Bedrooms: number;
  Bathrooms: number;
  Parking: number;
  Age: number;
  LocationScore: number;
  MetroDistance: number;
  SchoolDistance: number;
  HospitalDistance: number;
  CrimeRate: number;
  PopulationDensity: number;
  City: string;
  Locality: string;
  PropertyType: string;
  Furnishing: string;
}

export interface PredictionResult {
  prediction: {
    estimated_price: number;
    price_lower_bound: number;
    price_upper_bound: number;
    confidence_margin_pct: number;
    is_ml_prediction: boolean;
  };
  property_profile: PredictionInput;
  market_insights: {
    price_per_sqft: number;
    location_tier: string;
    estimated_monthly_rent: number;
  };
}

export interface InvestmentInput {
  purchase_price: number;
  monthly_rent: number;
  down_payment_pct: number;
  interest_rate_pct: number;
  loan_term_years: number;
  annual_appreciation_pct: number;
  property_tax_rate_pct: number;
  maintenance_rate_pct: number;
}

export interface CashFlowYear {
  year: number;
  property_value: number;
  remaining_loan: number;
  equity: number;
  annual_rent: number;
  mortgage_payment: number;
  expenses: number;
  net_cash_flow: number;
  cumulative_cash_flow: number;
  roi_pct: number;
}

export interface InvestmentResult {
  purchase_price: number;
  down_payment: number;
  loan_amount: number;
  monthly_mortgage: number;
  annual_expenses: number;
  metrics: {
    cap_rate_pct: number;
    cash_on_cash_pct: number;
    total_roi_10yr_pct: number;
    break_even_year: number;
  };
  cash_flow_projection: CashFlowYear[];
}

export interface ModelMetadata {
  is_trained: boolean;
  r2_score: number;
  mean_squared_error_rmse: number;
  feature_names: string[];
  feature_importances: Record<string, number>;
}
