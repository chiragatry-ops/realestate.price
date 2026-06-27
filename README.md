# Real Estate Price Prediction & Investment Analyzer

A production-ready full-stack analytical workspace for predicting property prices using Decision Ensembles (Gradient Boosting Regressors) and calculating deep long-term financial ROI with interactive geographic maps.

---

## 🚀 Technology Stack

### Backend Architecture
- **Runtime Environment:** Node.js (v18+) with TypeScript (`tsx` execution engine)
- **Framework:** Express.js for the API Gateway and proxy bridge
- **Python ML Microservice:** Flask (Python 3) serving Scikit-Learn pipelines
- **ML Models:** `GradientBoostingRegressor` (Decision Tree Ensembles) with `StandardScaler` pipeline state
- **Bundling Engine:** `esbuild` for compiling TypeScript server entry points into single, hyper-optimized CommonJS outputs (`dist/server.cjs`)

### Frontend Architecture
- **Framework:** React 19 with Vite 6 (Single Page Application configuration)
- **Styling Engine:** Tailwind CSS v4 featuring native design variable compilation
- **State Management:** Fully reactive localized functional hooks and context bounds
- **Geographic Information Systems (GIS):** React Leaflet with OpenStreetMap and CartoDB (Sleek Dark Map / Voyager light map transitions)
- **Interactive Data Visualization:** Custom SVG/D3-adjacent mathematical bar and line graphing engines
- **Animation Suite:** `motion` (Framer Motion adjacent engine) for smooth fluid layouts

---

## 🗂️ Folder Structure

```text
├── .env.example              # Template specifying environment parameters
├── .gitignore                # Optimized repository path exclusion filters
├── LICENSE                   # Software licensing agreement (MIT)
├── README.md                 # Primary technical directory and overview
├── index.html                # Main web index viewport anchor
├── metadata.json             # Application metadata, frame permissions, and capabilities
├── package.json              # NPM manifest (scripts, dependencies, node bindings)
├── project_report.md         # Comprehensive engineering, algorithm, and mathematical specifications
├── server.ts                 # Full-stack combined express backend + Vite proxy gateway
├── tsconfig.json             # TypeScript compiler ruleset configuration
├── vite.config.ts            # Vite compiler configuration
├── backend/                  # Python machine learning microservice
│   ├── app.py                # Flask server, route controllers, and proxy handlers
│   └── model.py              # ML pipeline, model definitions, and custom training routines
└── src/                      # Client React application source
    ├── main.tsx              # React mounting entry point
    ├── App.tsx               # Primary single-page viewport router and app Shell
    ├── types.ts              # Declarative TypeScript schemas, interface systems, and enums
    ├── index.css             # Tailwind v4 import registry and CSS theme definitions
    ├── components/           # Modular visual components
    │   ├── Charts.tsx        # High-fidelity SVG-based charts (bar & line graph)
    │   ├── Dashboard.tsx     # ML performance KPIs and feature importance visualizers
    │   ├── Footer.tsx        # Responsive persistent portal footer
    │   ├── InvestmentCalculator.tsx # Long-term ROI input panels with custom validation triggers
    │   ├── Loading.tsx       # Standard skeletal load systems for async tasks
    │   ├── Map.tsx           # Leaflet GIS canvas featuring layer toggles, clusters, and crime heatmaps
    │   ├── Navbar.tsx        # Interactive portal toolbar with dark-mode controls
    │   └── PredictionForm.tsx # Advanced ML-Scoring parameter inputs
    └── pages/                # Multi-tab viewports
        ├── Home.tsx          # Dashboard landing, hero banner, and model metrics overview
        ├── Investment.tsx    # Comprehensive Ledger tables and long-term amortization trends
        └── Prediction.tsx    # Property evaluation workspace linking directly to ROI tools
```

---

## 🛠️ Professional Installation Guide

Ensure you have **Node.js v18+**, **NPM**, and **Python 3.9+** with `pip` installed on your host system.

### Step 1: Clone and Set Up Dependencies
```bash
# Clone the repository and navigate into the root directory
cd real-estate-analyzer

# Install frontend and Express server NPM dependencies
npm install

# (Optional) Ensure Python virtual environment exists and install ML requirements
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt || pip install flask scikit-learn numpy pandas
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory by duplicating `.env.example`:
```bash
cp .env.example .env
```
Ensure the variables are configured correctly:
```env
PORT=3000
NODE_ENV=development
# Add any private third-party configurations if applicable
```

### Step 3: Run the Development Server
This boots up the integrated combined gateway. Express automatically spawns the Python Flask server on port `5000` as a child process and maps all requests dynamically.
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Step 4: Verification (Linter & Build checks)
```bash
# Verify static analysis and compiler type checks pass without warning
npm run lint

# Compile the application bundle
npm run build
```

---

## 📡 API Documentation

The gateway runs on `port 3000` and proxies routing dynamically to the underlying Python execution container if active, falling back gracefully to the native high-fidelity TypeScript modeling engine on error.

### 1. Gateway Health Check
- **Endpoint:** `GET /api/health`
- **Output:**
```json
{
  "status": "healthy",
  "service": "Real Estate Price Prediction and Investment Analyzer API",
  "model_status": "loaded",
  "is_ml_prediction_ready": true,
  "version": "1.0.0"
}
```

### 2. Model Scoring & Valuation
- **Endpoint:** `POST /api/predict`
- **Headers:** `Content-Type: application/json`
- **Input Parameters:**
```json
{
  "area_sqft": 2400,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "location": "Downtown",
  "year_built": 2018,
  "condition_grade": 4
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "estimated_price": 582400,
      "price_lower_bound": 512512,
      "price_upper_bound": 652288,
      "confidence_margin_pct": 12.0,
      "is_ml_prediction": true
    },
    "property_profile": {
      "area_sqft": 2400,
      "bedrooms": 3,
      "bathrooms": 2.5,
      "location": "Downtown",
      "year_built": 2018,
      "condition_grade": 4
    },
    "market_insights": {
      "price_per_sqft": 242.67,
      "location_tier": "Premium",
      "estimated_monthly_rent": 3200
    }
  }
}
```

### 3. Comprehensive Financial Projection
- **Endpoint:** `POST /api/investment`
- **Headers:** `Content-Type: application/json`
- **Input Parameters:**
```json
{
  "purchase_price": 450000,
  "monthly_rent": 2500,
  "down_payment_pct": 20,
  "interest_rate_pct": 6.5,
  "loan_term_years": 30,
  "annual_appreciation_pct": 4.5,
  "property_tax_rate_pct": 1.2,
  "maintenance_rate_pct": 1.0
}
```
- **Response:** Detailed mathematical ledger containing compounding projections across 15 standard annual cycles:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "down_payment": 90000,
      "loan_amount": 360000,
      "initial_cash_invested": 99000,
      "monthly_mortgage_pi": 2275,
      "cap_rate_pct": 5.4,
      "cash_on_cash_return_pct": 3.8,
      "ten_year_total_roi_pct": 114.2
    },
    "projections": [
      {
        "year": 1,
        "property_value": 470250,
        "remaining_loan": 354200,
        "equity": 116050,
        "annual_rental_income": 30000,
        "cash_flow": 3800,
        "cumulative_cash_flow": 3800,
        "total_roi_pct": 18.2
      }
    ]
  }
}
```

### 4. Machine Learning Model Evaluation Metrics
- **Endpoint:** `GET /api/metrics`
- **Response:**
```json
{
  "success": true,
  "metrics": {
    "algorithm": "Gradient Boosting Regressor (Scikit-Learn)",
    "is_trained": true,
    "r2_score": 0.8942,
    "mean_squared_error_rmse": 24320.15,
    "feature_importances": {
      "area_sqft": 0.54,
      "loc_Waterfront": 0.21,
      "age": 0.08,
      "condition_grade": 0.06
    }
  }
}
```

---

## 💻 Usage Instructions

### 1. Home Dashboard
Understand general engine capabilities. View high-level metrics representing model prediction variance ($R^2$ fit scores, Root Mean Squared error standard deviation). Click **Re-Train Model** to trigger hyperparameter optimizations on the background ensemble models.

### 2. AI Valuation Workspace
1. Select a Metropolitan Center (Chicago, New York, Miami, Los Angeles, or Houston).
2. Input target spatial values (GFA Sqft, Room indices, Construction age, Property physical grade).
3. Interact with the **GIS Map Canvas**:
   - Toggle filters for **Nearby Metro lines, Schools, Hospitals, or Retail Malls** to inspect local walking indices.
   - Activate the **Crime Heatmap** to visualize regional security density bounds.
   - Toggle marker **Clustering** to group elements cleanly.
4. Review model pricing and expected rent ranges.
5. Click **Model ROI in Calc Suite** to bridge the pricing output instantly into the amortization scheduler.

### 3. Financial Analyzer
Review the generated 15-year Ledger showing remaining debt balances, tax compounding, cash-on-cash metrics, and overall return yield indicators. Modify down payment ratios and terms to observe leverage efficiency changes.

---

## 🚢 Deployment Guide

This workspace is fully optimized for containerized architectures (such as **Google Cloud Run**, AWS Fargate, or Kubernetes):

### Build-Phase Orchestration
The build system utilizes a multi-step bundler. First, Vite compiles the front-end static SPA code. Next, `esbuild` bundles the Express engine into `dist/server.cjs` compiling all ESM imports cleanly to bypass strict Node runtime checks.

```bash
# Build the production bundle
npm run build
```

### Production Execution
Boot the application via:
```bash
npm run start
```
By default, the reverse proxy exposes only **Port 3000** externally.

---

## 🔮 Future Scope

1. **Live MLS Sync Pipeline:** Enable persistent integrations with live Multiple Listing Services (MLS) via standardized API feeds.
2. **Satellite & Aerial Analysis:** Integrate Gemini Vision API capabilities to read aerial and street-view photos of properties, generating automated condition grades (1 to 5) directly.
3. **Advanced GIS Multi-Modality:** Include real-time elevation indices, localized noise maps, and flood risk zones to expand feature parameters.
4. **Enhanced Ensemble Optimization:** Introduce automatic hyperparameter tuning loops via XGBoost and LightGBM models.
