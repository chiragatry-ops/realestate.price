import React, { useState } from 'react';
import { InvestmentResult, CashFlowYear } from '../types';
import { InvestmentCalculator } from '../components/InvestmentCalculator';
import { Charts } from '../components/Charts';
import { BarChart3, TrendingUp, DollarSign, Percent, Calendar, ShieldAlert, Award } from 'lucide-react';

interface InvestmentProps {
  initialPrice?: number;
  initialRent?: number;
}

export const Investment: React.FC<InvestmentProps> = ({ initialPrice = 450000, initialRent = 2500 }) => {
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const handleCalculated = (res: InvestmentResult) => {
    setResult(res);
  };

  const chartData = result?.cash_flow_projection
    ? result.cash_flow_projection.map(yr => ({
        label: `Yr ${yr.year}`,
        value: yr.equity
      }))
    : [];

  return (
    <div id="investment-page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5.5 h-5.5 text-emerald-500" />
            Amortization ROI Suite
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Forecast long-term cash flow, principal amortization schedules, and capitalization rates.
          </p>
        </div>
      </div>

      {/* Core Calculator Module */}
      <InvestmentCalculator
        onCalculate={handleCalculated}
        initialPrice={initialPrice}
        initialRent={initialRent}
      />

      {/* Numerical and Visual Outputs */}
      {result && (
        <div className="space-y-6">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Monthly Mortgage Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-sm">
              <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Mortgage (P+I)</div>
              <div id="mortgage-value" className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1 font-mono">
                ${result.monthly_mortgage.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Principal amount: ${result.loan_amount.toLocaleString()}
              </p>
            </div>

            {/* Cap Rate Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-sm">
              <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Capitalization Rate</div>
              <div id="cap-rate-value" className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {result.metrics.cap_rate_pct.toFixed(2)}%
              </div>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                Annual net yield margin
              </p>
            </div>

            {/* Cash on Cash ROI Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-sm">
              <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cash-on-Cash Return</div>
              <div id="cash-return-value" className={`text-xl sm:text-2xl font-black mt-1 font-mono ${
                result.metrics.cash_on_cash_pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}>
                {result.metrics.cash_on_cash_pct.toFixed(2)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Down payment leverage efficiency
              </p>
            </div>

            {/* 10 Year ROI forecast */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-sm">
              <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">10-Year Cumulative ROI</div>
              <div id="total-roi-value" className="text-xl sm:text-2xl font-black text-indigo-500 mt-1 font-mono">
                {result.metrics.total_roi_10yr_pct.toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Principal build + appreciation
              </p>
            </div>
          </div>

          {/* Graphical Projection & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Amortization graph */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Long-term Equity Growth</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Visual forecasting representing principal debt payoff coupled with annual property compounding appreciation.
                </p>
              </div>
              <Charts type="line" data={chartData} title="Projected asset equity value" color="emerald" />
            </div>

            {/* Core Summary glossary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Financing Summary</h3>
                </div>

                <div className="space-y-3 font-mono text-[11px] mt-4">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                    <span className="text-slate-400">DOWN_PAYMENT</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${result.down_payment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                    <span className="text-slate-400">FINANCED_LOAN</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${result.loan_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                    <span className="text-slate-400">ANNUAL_EXP_TAX_MAINT</span>
                    <span className="font-bold text-rose-500">${result.annual_expenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">BREAK_EVEN_YEAR</span>
                    <span className="font-bold text-emerald-500">Year {result.metrics.break_even_year}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-start gap-2 mt-6">
                <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-normal">
                  Projections assume static vacancy rates. Localized property taxes and HOA dues may influence actual yields.
                </p>
              </div>
            </div>
          </div>

          {/* Comprehensive Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Amortization & Net Cash Flow Ledger</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Yearly detailed projection model across 15 compounding cycles.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table id="amortization-table" className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/40 text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-850">
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Property Value</th>
                    <th className="py-3 px-4">Equity</th>
                    <th className="py-3 px-4">Remaining Loan</th>
                    <th className="py-3 px-4">Gross Rent</th>
                    <th className="py-3 px-4">Net Cash Flow</th>
                    <th className="py-3 px-4">ROI %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {result.cash_flow_projection.map((yr) => (
                    <tr key={yr.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-mono transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">Year {yr.year}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">${yr.property_value.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">${yr.equity.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500">${yr.remaining_loan.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">${yr.annual_rent.toLocaleString()}</td>
                      <td className={`py-3 px-4 font-bold ${yr.net_cash_flow >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {yr.net_cash_flow >= 0 ? '+' : '-'}${Math.abs(yr.net_cash_flow).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-500">{yr.roi_pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
