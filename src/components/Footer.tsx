import React from 'react';
import { Database, Sparkles, Compass, BarChart3, HelpCircle } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  isTrained: boolean;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, isTrained }) => {
  return (
    <footer id="app-footer" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div id="footer-inner" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand/Product Column */}
          <div id="footer-brand-col" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                VALUATE<span className="text-emerald-500 font-semibold text-xs tracking-wider uppercase bg-emerald-500/10 px-1 rounded ml-1">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              State-of-the-art Gradient Boosting Regressor predictive pipeline for real estate valuation. Harnessing deep location scores, demographic densities, and real-time amortization charts.
            </p>
          </div>

          {/* Quick Links Column */}
          <div id="footer-links-col" className="flex flex-col gap-2.5">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Application Modules
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <button
                id="footer-nav-home"
                onClick={() => setCurrentTab('home')}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
              >
                Dashboard
              </button>
              <button
                id="footer-nav-valuation"
                onClick={() => setCurrentTab('prediction')}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
              >
                AI Valuation Workspace
              </button>
              <button
                id="footer-nav-investment"
                onClick={() => setCurrentTab('investment')}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors"
              >
                Amortization ROI Suite
              </button>
            </div>
          </div>

          {/* Engine Metadata Column */}
          <div id="footer-meta-col" className="flex flex-col gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Engine Infrastructure
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>DATA_FEDERATION: 5,000 Records (housing.csv)</span>
              </div>
              <div>OPTIMIZATION: Grid Searched Hyperparameters</div>
              <div>STABILIZATION: Standardized Feature Pipeline</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div id="footer-bottom" className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} ValuateAI Platform. All predictive outputs are mathematically modeled estimations.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Target Frame Context: UTC-7 Deployment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
