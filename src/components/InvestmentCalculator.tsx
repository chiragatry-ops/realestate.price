import React, { useState, useEffect } from 'react';
import { InvestmentInput, InvestmentResult, CashFlowYear } from '../types';
import { Percent, DollarSign, Calendar, TrendingUp, ShieldAlert, Sparkles, Receipt, HelpCircle } from 'lucide-react';

interface InvestmentCalculatorProps {
  onCalculate: (result: InvestmentResult) => void;
  initialPrice?: number;
  initialRent?: number;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
  onCalculate,
  initialPrice = 450000,
  initialRent = 2500
}) => {
  const [inputs, setInputs] = useState<InvestmentInput>({
    purchase_price: initialPrice,
    monthly_rent: initialRent,
    down_payment_pct: 20,
    interest_rate_pct: 6.5,
    loan_term_years: 30,
    annual_appreciation_pct: 4.5,
    property_tax_rate_pct: 1.2,
    maintenance_rate_pct: 1.0,
  });

  // Automatically recalculate initial inputs if parent provides new ones
  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      purchase_price: initialPrice,
      monthly_rent: initialRent
    }));
  }, [initialPrice, initialRent]);

  // Handle local state updates
  const handleInputChange = (field: keyof InvestmentInput, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Perform detailed real estate financial calculations in-frontend for speed and fidelity
  const calculateMetrics = () => {
    const down_payment = inputs.purchase_price * (inputs.down_payment_pct / 100);
    const loan_amount = inputs.purchase_price - down_payment;
    
    // Monthly mortgage payment (P + I)
    const monthly_interest_rate = (inputs.interest_rate_pct / 100) / 12;
    const number_of_payments = inputs.loan_term_years * 12;
    
    let monthly_mortgage = 0;
    if (monthly_interest_rate > 0) {
      monthly_mortgage = loan_amount * 
        (monthly_interest_rate * Math.pow(1 + monthly_interest_rate, number_of_payments)) / 
        (Math.pow(1 + monthly_interest_rate, number_of_payments) - 1);
    } else {
      monthly_mortgage = loan_amount / number_of_payments;
    }

    // Annual expenses (Tax + Maintenance)
    const annual_property_tax = inputs.purchase_price * (inputs.property_tax_rate_pct / 100);
    const annual_maintenance = inputs.purchase_price * (inputs.maintenance_rate_pct / 100);
    const annual_insurance = inputs.purchase_price * 0.0035; // 0.35% home insurance standard
    const total_annual_expenses = annual_property_tax + annual_maintenance + annual_insurance;

    // Rental capitalization
    const gross_annual_rent = inputs.monthly_rent * 12;
    const net_operating_income = gross_annual_rent - total_annual_expenses;
    const cap_rate = (net_operating_income / inputs.purchase_price) * 100;

    // Cash on Cash Return
    const annual_debt_service = monthly_mortgage * 12;
    const annual_cash_flow = net_operating_income - annual_debt_service;
    const cash_on_cash = (annual_cash_flow / down_payment) * 100;

    // 10 Year projection matrix
    const projections: CashFlowYear[] = [];
    let cumulative_cash_flow = -down_payment;
    let current_value = inputs.purchase_price;
    let remaining_loan = loan_amount;
    let break_even_year = -1;

    for (let year = 1; year <= 15; year++) {
      // Annual compounding appreciation
      current_value = current_value * (1 + inputs.annual_appreciation_pct / 100);
      
      // Compounded rental appreciation (assume rent climbs at half appreciation rate)
      const current_rent = inputs.monthly_rent * Math.pow(1 + (inputs.annual_appreciation_pct / 200), year - 1) * 12;
      
      // Deduct interest paid to calculate principal reduction
      let annual_interest_paid = 0;
      let annual_principal_paid = 0;
      for (let m = 0; m < 12; m++) {
        const interest = remaining_loan * monthly_interest_rate;
        const principal = monthly_mortgage - interest;
        annual_interest_paid += interest;
        annual_principal_paid += principal;
        remaining_loan = Math.max(0, remaining_loan - principal);
      }

      const annual_tax = current_value * (inputs.property_tax_rate_pct / 100);
      const annual_maint = current_value * (inputs.maintenance_rate_pct / 100);
      const annual_ins = current_value * 0.0035;
      const yr_expenses = annual_tax + annual_maint + annual_ins;

      const yr_net_cash_flow = current_rent - yr_expenses - annual_debt_service;
      cumulative_cash_flow += yr_net_cash_flow;

      const equity = current_value - remaining_loan;
      const yr_roi = ((equity + cumulative_cash_flow) / down_payment) * 100;

      if (cumulative_cash_flow >= 0 && break_even_year === -1) {
        break_even_year = year;
      }

      projections.push({
        year,
        property_value: Math.round(current_value),
        remaining_loan: Math.round(remaining_loan),
        equity: Math.round(equity),
        annual_rent: Math.round(current_rent),
        mortgage_payment: Math.round(annual_debt_service),
        expenses: Math.round(yr_expenses),
        net_cash_flow: Math.round(yr_net_cash_flow),
        cumulative_cash_flow: Math.round(cumulative_cash_flow),
        roi_pct: parseFloat(yr_roi.toFixed(2))
      });
    }

    const total_equity_10yr = projections[9]?.equity || 0;
    const total_roi_10yr = ((total_equity_10yr + cumulative_cash_flow) / down_payment) * 100;

    const result: InvestmentResult = {
      purchase_price: inputs.purchase_price,
      down_payment: Math.round(down_payment),
      loan_amount: Math.round(loan_amount),
      monthly_mortgage: Math.round(monthly_mortgage),
      annual_expenses: Math.round(total_annual_expenses),
      metrics: {
        cap_rate_pct: parseFloat(cap_rate.toFixed(2)),
        cash_on_cash_pct: parseFloat(cash_on_cash.toFixed(2)),
        total_roi_10yr_pct: parseFloat(total_roi_10yr.toFixed(2)),
        break_even_year: break_even_year === -1 ? 15 : break_even_year
      },
      cash_flow_projection: projections
    };

    onCalculate(result);
  };

  // Trigger calculation upon key parameters update
  useEffect(() => {
    calculateMetrics();
  }, [inputs]);

  return (
    <div id="investment-calculator-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
      
      {/* Left Input Section */}
      <div id="investment-inputs" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Purchase & Financing Structure</h3>
        </div>

        {/* Purchase Price Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Property Purchase Price</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-300 font-bold">
              ${inputs.purchase_price.toLocaleString()}
            </span>
          </div>
          <input
            id="range-purchase-price"
            type="range"
            min={50000}
            max={2000000}
            step={10000}
            value={inputs.purchase_price}
            onChange={(e) => handleInputChange('purchase_price', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        {/* Monthly Rent Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Expected Monthly Rent</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-300 font-bold">
              ${inputs.monthly_rent.toLocaleString()}
            </span>
          </div>
          <input
            id="range-monthly-rent"
            type="range"
            min={300}
            max={15000}
            step={100}
            value={inputs.monthly_rent}
            onChange={(e) => handleInputChange('monthly_rent', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        {/* Down payment and Interest rate in a tight grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Downpayment Pct */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Down Payment %</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inputs.down_payment_pct}%</span>
            </div>
            <input
              id="range-downpayment"
              type="range"
              min={5}
              max={80}
              step={5}
              value={inputs.down_payment_pct}
              onChange={(e) => handleInputChange('down_payment_pct', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Interest Rate %</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inputs.interest_rate_pct}%</span>
            </div>
            <input
              id="range-interest-rate"
              type="range"
              min={1.0}
              max={15.0}
              step={0.1}
              value={inputs.interest_rate_pct}
              onChange={(e) => handleInputChange('interest_rate_pct', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Right Input Section (Ancillary Expenses & Assumptions) */}
      <div id="investment-ancillaries" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-500">
            <Receipt className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Operating Expenses & Appreciation</h3>
        </div>

        {/* Loan Term */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Loan Amortization Period</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[15, 20, 30].map((t) => (
              <button
                type="button"
                key={t}
                id={`loan-term-btn-${t}`}
                onClick={() => handleInputChange('loan_term_years', t)}
                className={`py-2 text-xs font-medium rounded-lg text-center border transition-all ${
                  inputs.loan_term_years === t
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {t} Years
              </button>
            ))}
          </div>
        </div>

        {/* Property Tax Rate */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Property Tax Rate</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inputs.property_tax_rate_pct}% / yr</span>
          </div>
          <input
            id="range-tax-rate"
            type="range"
            min={0.2}
            max={4.0}
            step={0.1}
            value={inputs.property_tax_rate_pct}
            onChange={(e) => handleInputChange('property_tax_rate_pct', Number(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        {/* Annual Appreciation Rate */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Expected Annual Appreciation</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inputs.annual_appreciation_pct}% / yr</span>
          </div>
          <input
            id="range-appreciation-rate"
            type="range"
            min={0.0}
            max={12.0}
            step={0.1}
            value={inputs.annual_appreciation_pct}
            onChange={(e) => handleInputChange('annual_appreciation_pct', Number(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
