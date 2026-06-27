import React from 'react';
import { motion } from 'motion/react';
import { ModelMetadata } from '../types';
import { Dashboard } from '../components/Dashboard';
import { Compass, BarChart3, Map, ShieldAlert, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';

interface HomeProps {
  metadata: ModelMetadata | null;
  onTriggerTrain: () => void;
  isTraining: boolean;
  setCurrentTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  metadata,
  onTriggerTrain,
  isTraining,
  setCurrentTab
}) => {
  return (
    <div id="home-page" className="space-y-10">
      
      {/* Premium Hero Banner */}
      <section id="hero-banner" className="relative rounded-3xl bg-slate-900 text-white overflow-hidden p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-xl">
        {/* Animated ambient backdrop */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 blur-3xl" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          {/* Hero text */}
          <div className="lg:col-span-3 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Gradient Boosting Regressor Active</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Predictive Real Estate Valuation with <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Decision Ensembles</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Durable pricing indices driven by deep topological scores, spatial proximity vectors, and localized property features. Calculate comprehensive asset valuations and multi-decade amortization ROI.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-btn-valuation"
                onClick={() => setCurrentTab('prediction')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>AI VALUATION WORKSPACE</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                id="hero-btn-roi"
                onClick={() => setCurrentTab('investment')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>AMORTIZATION ROI SUITE</span>
              </button>
            </div>
          </div>

          {/* Core Feature Bullet points */}
          <div className="lg:col-span-2 space-y-3.5 bg-slate-950/45 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              Engine Capabilities
            </span>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Standardized Scale Transforms</div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Utilizes robust scikit-learn standard scaling to align spatial scores, population density, and unit physical parameters.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Gradient Boosting Regressor</div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Scored on over 5,000 synthetic housing records with a 0.07 learning rate and 220 estimators to suppress pricing bias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-200">Amortization ROI Engine</div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Simulates dynamic yearly projections of home appreciation, tax structures, principal debt payments, and cap rate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Model Analytics Dashboard Embedded inside Home */}
      <section id="dashboard-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Machine Learning Model Metrics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Real-time model performance stats derived from training evaluation arrays.
            </p>
          </div>
        </div>
        <Dashboard
          metadata={metadata}
          onTriggerTrain={onTriggerTrain}
          isTraining={isTraining}
        />
      </section>
    </div>
  );
};
