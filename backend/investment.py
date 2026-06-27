import numpy as np

def calculate_monthly_mortgage(loan_amount, annual_interest_rate_pct, term_years):
    """
    Calculate the monthly mortgage payment (Principal + Interest).
    """
    if loan_amount <= 0:
        return 0.0
    
    monthly_rate = (annual_interest_rate_pct / 100.0) / 12.0
    num_payments = term_years * 12
    
    if monthly_rate == 0:
        return loan_amount / num_payments
    
    # Standard amortization formula
    monthly_payment = loan_amount * (monthly_rate * (1 + monthly_rate) ** num_payments) / (((1 + monthly_rate) ** num_payments) - 1)
    return float(monthly_payment)


def calculate_amortization_schedule(loan_amount, annual_interest_rate_pct, term_years, years_to_project=10):
    """
    Generates a yearly schedule of remaining loan balances, interest paid, and principal paid.
    """
    if loan_amount <= 0:
        return [0.0] * (years_to_project + 1)
    
    monthly_rate = (annual_interest_rate_pct / 100.0) / 12.0
    monthly_payment = calculate_monthly_mortgage(loan_amount, annual_interest_rate_pct, term_years)
    
    balance = loan_amount
    yearly_balances = [loan_amount]
    
    for year in range(1, years_to_project + 1):
        if year > term_years:
            yearly_balances.append(0.0)
            continue
            
        principal_paid_this_year = 0.0
        for month in range(12):
            if balance <= 0:
                break
            interest = balance * monthly_rate
            principal = min(monthly_payment - interest, balance)
            balance -= principal
            principal_paid_this_year += principal
            
        yearly_balances.append(float(round(balance, 2)))
        
    return yearly_balances


def analyze_investment(params):
    """
    Analyzes the investment potential of a property based on validated input parameters.
    """
    purchase_price = params["purchase_price"]
    monthly_rent = params["monthly_rent"]
    down_payment_pct = params["down_payment_pct"]
    interest_rate_pct = params["interest_rate_pct"]
    loan_term_years = params["loan_term_years"]
    annual_appreciation_pct = params["annual_appreciation_pct"]
    property_tax_rate_pct = params["property_tax_rate_pct"]
    maintenance_rate_pct = params["maintenance_rate_pct"]
    
    # Financial calculations
    down_payment = purchase_price * (down_payment_pct / 100.0)
    loan_amount = purchase_price - down_payment
    
    # Initial closing costs (estimated at 2% of purchase price)
    closing_costs = purchase_price * 0.02
    initial_cash_invested = down_payment + closing_costs
    
    # Mortgage calculation
    monthly_mortgage = calculate_monthly_mortgage(loan_amount, interest_rate_pct, loan_term_years)
    annual_mortgage = monthly_mortgage * 12
    
    # Annual operational expenses
    annual_tax = purchase_price * (property_tax_rate_pct / 100.0)
    annual_maintenance = purchase_price * (maintenance_rate_pct / 100.0)
    # Estimated annual insurance (0.4% of property value)
    annual_insurance = purchase_price * 0.004
    
    total_operating_expenses = annual_tax + annual_maintenance + annual_insurance
    
    # Rental income
    annual_gross_rent = monthly_rent * 12
    # Assume 5% vacancy loss
    vacancy_loss = annual_gross_rent * 0.05
    effective_gross_income = annual_gross_rent - vacancy_loss
    
    # Net Operating Income (NOI)
    noi = effective_gross_income - total_operating_expenses
    
    # Cap Rate
    cap_rate = (noi / purchase_price) * 100.0 if purchase_price > 0 else 0.0
    
    # Annual Cash Flow (NOI - Debt Service)
    annual_cash_flow = noi - annual_mortgage
    
    # Cash-on-Cash Return
    cash_on_cash_return = (annual_cash_flow / initial_cash_invested) * 100.0 if initial_cash_invested > 0 else 0.0
    
    # Multi-year projection (10 Years)
    projection_years = 10
    loan_balances = calculate_amortization_schedule(loan_amount, interest_rate_pct, loan_term_years, projection_years)
    
    projections = []
    current_property_value = purchase_price
    current_annual_rent = annual_gross_rent
    
    cumulative_cash_flow = 0.0
    
    for year in range(1, projection_years + 1):
        # Update values for the year with growth rates
        # Property value appreciates
        current_property_value *= (1 + annual_appreciation_pct / 100.0)
        # Rent appreciates at a modest 2.5% rate or appreciation rate
        rent_increase_rate = min(2.5, annual_appreciation_pct)
        current_annual_rent *= (1 + rent_increase_rate / 100.0)
        
        # Expenses increase by 2% inflation
        year_tax = annual_tax * (1.02 ** year)
        year_maintenance = annual_maintenance * (1.02 ** year)
        year_insurance = annual_insurance * (1.02 ** year)
        year_expenses = year_tax + year_maintenance + year_insurance
        
        year_vacancy = current_annual_rent * 0.05
        year_effective_rent = current_annual_rent - year_vacancy
        
        year_noi = year_effective_rent - year_expenses
        year_mortgage = annual_mortgage if year <= loan_term_years else 0.0
        year_cash_flow = year_noi - year_mortgage
        cumulative_cash_flow += year_cash_flow
        
        # Equity = Property Value - Remaining Loan Balance
        remaining_loan = loan_balances[year]
        equity = current_property_value - remaining_loan
        
        # ROI for this specific year
        # Total profit if sold = (Property Value - Remaining Loan) + Cumulative Cash Flow - Initial Cash Invested
        total_gains = equity + cumulative_cash_flow - initial_cash_invested
        total_roi_pct = (total_gains / initial_cash_invested) * 100.0 if initial_cash_invested > 0 else 0.0
        
        projections.append({
            "year": year,
            "property_value": float(round(current_property_value, 2)),
            "remaining_loan": float(round(remaining_loan, 2)),
            "equity": float(round(equity, 2)),
            "annual_rental_income": float(round(current_annual_rent, 2)),
            "cash_flow": float(round(year_cash_flow, 2)),
            "cumulative_cash_flow": float(round(cumulative_cash_flow, 2)),
            "total_roi_pct": float(round(total_roi_pct, 2))
        })
        
    # Calculate investment rating
    rating = "Medium"
    reasons = []
    
    if cash_on_cash_return > 8.0 and cap_rate > 6.0:
        rating = "Strong Buy"
        reasons.append("Excellent cash-on-cash return (>8%) and solid capitalization rate (>6%).")
    elif cash_on_cash_return > 4.0 or cap_rate > 4.5:
        rating = "Good Buy"
        reasons.append("Healthy cap rate or positive cash-on-cash returns showing stable performance.")
    elif cash_on_cash_return < 0.0:
        rating = "Avoid/High Risk"
        reasons.append("Negative initial cash flow. Financing or operating costs exceed effective rental income.")
    else:
        rating = "Hold/Fair"
        reasons.append("Moderate return profile. Strong appreciation might be needed to justify initial cash outlay.")
        
    if params["annual_appreciation_pct"] >= 5.0:
        reasons.append("Strong asset appreciation potential boosts long-term equity growth.")
    
    return {
        "metrics": {
            "down_payment": float(round(down_payment, 2)),
            "loan_amount": float(round(loan_amount, 2)),
            "initial_cash_invested": float(round(initial_cash_invested, 2)),
            "monthly_mortgage_pi": float(round(monthly_mortgage, 2)),
            "annual_mortgage_pi": float(round(annual_mortgage, 2)),
            "first_year_operating_expenses": float(round(total_operating_expenses, 2)),
            "first_year_vacancy_loss": float(round(vacancy_loss, 2)),
            "first_year_noi": float(round(noi, 2)),
            "cap_rate_pct": float(round(cap_rate, 2)),
            "first_year_cash_flow": float(round(annual_cash_flow, 2)),
            "cash_on_cash_return_pct": float(round(cash_on_cash_return, 2)),
            "ten_year_appreciation_value": float(round(projections[-1]["property_value"], 2)),
            "ten_year_equity": float(round(projections[-1]["equity"], 2)),
            "ten_year_cumulative_cash_flow": float(round(cumulative_cash_flow, 2)),
            "ten_year_total_roi_pct": float(round(projections[-1]["total_roi_pct"], 2))
        },
        "projections": projections,
        "recommendation": {
            "rating": rating,
            "reasons": reasons
        }
    }
