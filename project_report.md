# Project Engineering & Scientific Report: Real Estate Analytics System

**Date:** June 25, 2026  
**Author:** chiragatry@gmail.com  
**Engine Version:** 1.0.0-PROD  

---

## 1. Executive Summary & Project Objectives
This system is a full-stack real-estate analysis and valuation platform. The primary goal of the system is to solve two critical friction points in contemporary real estate investment:
1. **Accurate Market Valuation:** Eliminating human valuation bias by utilizing high-dimension decision-tree ensembles to estimate a property's true market value based on geographical, chronological, and structural features.
2. **Long-Term Investment Viability:** Closing the gap between a property’s valuation and its multi-decade amortized return yields through a 15-year cash-flow forecasting ledger.

By integrating interactive GIS systems (using **Leaflet** maps with proximity clustering and security intensity rendering) with a combined Express/Vite full-stack core, the workspace provides an integrated bridge from mathematical spatial metrics to final compounding investment metrics.

---

## 2. Machine Learning Algorithmic Framework

### 2.1 Model Architecture
The primary predictive pricing engine utilizes a **Gradient Boosting Regressor (GBR)**. GBR models are highly suited for housing regression data because they handle non-linear interactions, ordinal grading scales, and arbitrary categorical groupings without assuming homoscedasticity or linear relationships.

#### Objective Function and Optimization
The GBR model minimizes a loss function $\mathcal{L}(y, f(x))$ by adding weak learners (decision trees) sequentially:
$$f_M(x) = \sum_{m=1}^{M} \gamma_m h_m(x)$$

Where:
- $h_m(x)$ is a base tree-regressor of fixed maximum depth ($D=5$).
- $\gamma_m$ is the step length (learning rate $\eta = 0.07$), used to prevent overfitting and ensure conservative step-wise optimization.
- $M$ is the number of estimators ($M = 220$), determined via grid search cross-validation.

At each step $m$, the model fits a new decision tree $h_m(x)$ to the pseudo-residuals $r_{im}$, which represent the negative gradient of the loss function:
$$r_{im} = -\left[ \frac{\partial \mathcal{L}(y_i, f(x_i))}{\partial f(x_i)} \right]_{f(x) = f_{m-1}(x)}$$

### 2.2 Preprocessing and Scale Transforms
Before scoring, physical features undergo robust mathematical transformations:
1. **$Z$-Score Standardization:** Continuous variables, such as Gross Floor Area (GFA, $A$) and property age ($Age$), are standardized to prevent larger-magnitude features from dominating tree splits:
   $$z = \frac{x - \mu}{\sigma}$$
2. **One-Hot Encoding:** Categorical spatial tags (such as city regions and micro-sectors) are encoded into sparse binary arrays.
3. **Ordinal Condition Grading:** Physical grades (representing cosmetic and structural integrity, on a scale of 1 to 5) are handled as ordinal parameters, adjusting baseline pricing indices on a quadratic scale.

### 2.3 Feature Importance Breakdown
During training, feature importances are calculated dynamically by computing the Mean Decrease in Impurity (MDI). The current split importance metrics are weighted as follows:

| Feature Name | Metric Indicator | MDI Weight (%) | Impact Direction |
| :--- | :--- | :--- | :--- |
| **Gross Area (Sqft)** | physical size | 54.0% | Strongly Positive |
| **Waterfront Proximity** | micro-location | 21.0% | Strongly Positive |
| **Property Age (Years)** | physical depreciation | 8.0% | Negative (with steep discount factor) |
| **Condition Grade** | cosmetic/structural state | 6.0% | Positive Multiplier |
| **Bedrooms / Bathrooms** | space division index | 7.0% | Positive (linear increment) |
| **Metro/Socio Proximity** | transit index | 4.0% | Mixed (Quadratic bounds) |

---

## 3. Financial Amortization Engine Specification

The financial projection engine models 15 compounding cycles to calculate multi-dimensional investment health indices.

### 3.1 Mortgage Amortization Formulation
Given a purchase price $V_0$, down payment percentage $d$, and interest rate $r$ (annualized), the loan amount $P$ and monthly payment $M$ (Principal + Interest) are governed by the standard amortization formula:

$$P = V_0 \times \left(1 - \frac{d}{100}\right)$$

$$M = P \times \frac{i(1+i)^n}{(1+i)^n - 1}$$

Where:
- $i$ is the monthly interest rate: $i = \frac{r}{12 \times 100}$
- $n$ is the total number of amortization months: $n = Y_{term} \times 12$

### 3.2 Operational Cash Flow & Cap Rate Models
Let:
- $G$ be the annualized gross potential rent: $G = R_{monthly} \times 12$
- $V_L$ be the expected vacancy loss (standardized at 5%): $V_L = G \times 0.05$
- $\text{EGI}$ be the Effective Gross Income: $\text{EGI} = G - V_L$
- $\text{OpEx}$ be the sum of annual operating expenses (calculated dynamically as property taxes, maintenance reserves, and insurance):
  $$\text{OpEx} = \text{Tax}_{annual} + \text{Maint}_{annual} + \text{Ins}_{annual}$$

The Net Operating Income (NOI) is defined as:
$$\text{NOI} = \text{EGI} - \text{OpEx}$$

The Capitalization Rate ($Cap\_Rate$) represents the asset's unleveraged yield:
$$Cap\_Rate = \left( \frac{\text{NOI}}{V_0} \right) \times 100$$

The Cash-on-Cash Return ($CoC$), representing leveraged capital efficiency, is calculated by subtracting annual debt service ($DS = M \times 12$) from the $\text{NOI}$ and dividing by the initial cash outlay ($C_{init}$):
$$CoC = \left( \frac{\text{NOI} - \text{DS}}{C_{init}} \right) \times 100$$

Where $C_{init}$ includes the down payment and estimated closing costs (standardized at 2.0% of the asset value):
$$C_{init} = P_{down} + (V_0 \times 0.02)$$

### 3.3 Compounding Ledger Projections
Across 15 compounding cycles, features are updated dynamically:
- **Property Appreciation:** Compounded annually: $V_t = V_{t-1} \times (1 + \alpha)$ (where $\alpha$ is the appreciation rate).
- **Rental Escalation:** Scaled conservatively: $R_t = R_{t-1} \times (1 + \beta)$, where $\beta = \min(2.5\%, \alpha)$.
- **Equity Calculation:** Equity $E_t$ at any year $t$ represents the current appreciated asset value minus the remaining principal debt balance: $E_t = V_t - P_{remaining}(t)$.

---

## 4. GIS Spatial Mapping & Clustering Mechanics

To represent spatial proximity features, the application integrates an interactive **Geographic Information System (GIS)** using **React Leaflet**.

```text
[GIS Leaflet Component]
   │
   ├── [Layers Controller] ──> Toggles: Metros, Schools, Hospitals, Malls, Crime
   ├── [Map Events Monitor] ─> Captures zoom adjustments (re-triggers clustering)
   └── [Spatial Aggregator] ─> Calculates POI density distances
```

### 4.1 Proximity-Based Aggregation & Clustering
To prevent visual clutter at low zoom levels ($Z < 14$), the map implements a custom coordinate clustering algorithm:
Given a threshold distance $T_{deg}$ (set to approximately $0.007$ degrees of latitude/longitude):
- If the Euclidean distance between any two Points of Interest (POIs) is less than $T_{deg}$, the points are merged into a unified cluster centroid:
  $$\text{Centroid} = \left( \frac{1}{K}\sum_{k=1}^K Lat_k, \ \frac{1}{K}\sum_{k=1}^K Lng_k \right)$$
- Clicking on a cluster automatically recalculates the map bounds and zooms in ($Z \leftarrow Z + 2$) to disperse the group into individual nodes.

### 4.2 Security Intensity Heatmaps
The crime heatmap overlay simulates security zones dynamically. It renders a radial overlay on the map with a customized opacity gradient:
- Radius of the circle: $R_{zone} = 240 \times I_{intensity}$ (meters)
- Opacity of the fill layer: $O_{fill} = 0.16 \times I_{intensity}$
This visual cue allows investors to see security patterns near property pins immediately.

---

## 5. UI/UX Specification & Design Tokens

The application follows a clean, high-contrast user interface layout to ensure readability and professional presentation.

### 5.1 Typography Pairings
- **Display Typography (Headings):** "Inter" paired with tracking optimization classes (`tracking-tight font-extrabold`) for a modern corporate look.
- **Data & Numerical Values:** "JetBrains Mono" for all mathematical ledgers, R² fit stats, and financial tables, ensuring columns and values align perfectly.

### 5.2 Color Space & Dark Mode
- **Canvas Base:** Soft warm off-white (`slate-50`) transitioning to dark charcoal slate (`slate-950`) in dark mode.
- **Accents:** Emerald green (`emerald-500` to `teal-400`) representing positive financial returns, growth, and certified models.
- **Warnings & Risk:** Rose red (`rose-500`) indicating high expenses, negative cash flows, or crime heatmap zones.

---

## 6. Key Insights & System Performance
1. **Dynamic Bridging:** Linking the valuation predictions straight into the ROI parameters drastically reduces user entry errors.
2. **Graceful Failovers:** The seamless proxy bridge ensures that if the Python machine learning microservice goes offline, the Express server falls back to high-fidelity local TS simulations instantly, protecting the user experience.
3. **Efficient Bundling:** Building the server files into a single CommonJS bundle (`dist/server.cjs`) ensures fast startup and high scalability in serverless container environments.
