import React, { useState } from 'react';
import { PredictionInput, PredictionResult } from '../types';
import { PredictionForm } from '../components/PredictionForm';
import { Map } from '../components/Map';
import { Loading } from '../components/Loading';
import { Compass, Sparkles, AlertCircle, ArrowRight, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { API_BASE } from '../config';
import axios from 'axios';

interface PredictionProps {
  onSendToROI: (price: number, rent: number) => void;
}

export const Prediction: React.FC<PredictionProps> = ({ onSendToROI }) => {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maintain shared spatial coordinates between Map and Form
  const [selectedCity, setSelectedCity] = useState('Chicago');
  const [selectedLocality, setSelectedLocality] = useState('Downtown');

  const handleFormSubmit = async (inputs: PredictionInput) => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    // Sync state city/locality with form
    setSelectedCity(inputs.City);
    setSelectedLocality(inputs.Locality);

    try {
      // Direct call to backend prediction API
      const response = await axios.post(`${API_BASE}/predict`, inputs);
      if (response.data?.success) {
        setResult(response.data.data);
      } else {
        throw new Error(response.data?.error || 'Valuation failure');
      }
    } catch (err: any) {
      console.error('Error during prediction fetch:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while calling the model pipeline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalitySelect = (localityId: string) => {
    setSelectedLocality(localityId);
    // Find matching profile mapping inputs or let form handle it
  };

  return (
    <div id="prediction-page" className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Compass className="w-5.5 h-5.5 text-emerald-500" />
            AI Valuation Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Score advanced housing features using scikit-learn standard scaling and Gradient Boosting ensembles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Form: Takes up 2 columns on extra-large screens */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
            <PredictionForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          </div>

          {/* Render Prediction Result if available */}
          {result && (
            <div id="valuation-results" className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Model Scoring Output</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ESTIMATION_COMPLETE</p>
                  </div>
                </div>
                <span className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                  {result.prediction.is_ml_prediction ? 'GRADIENT_BOOSTING' : 'FALLBACK_HEURISTIC'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Main Price Card */}
                <div className="bg-slate-950/45 p-5 rounded-xl border border-slate-800/80 space-y-2 text-center">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Estimated Market Value</span>
                  <div id="estimated-price" className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight leading-none py-1">
                    ${result.prediction.estimated_price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono leading-relaxed">
                    Range: ${result.prediction.price_lower_bound.toLocaleString()} - ${result.prediction.price_upper_bound.toLocaleString()}
                  </div>
                </div>

                {/* Ancillary Metrics Column */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price per SQFT */}
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800/40 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Price / SQFT</span>
                    <span id="price-per-sqft" className="text-lg font-bold text-slate-200 mt-1 font-mono">
                      ${result.market_insights.price_per_sqft.toFixed(2)}
                    </span>
                  </div>

                  {/* Estimated Monthly Rent */}
                  <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800/40 text-center flex flex-col justify-center">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Expected Rent</span>
                    <span id="expected-rent" className="text-lg font-bold text-teal-400 mt-1 font-mono">
                      ${result.market_insights.estimated_monthly_rent.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Send to Amortization ROI Module */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Like this asset valuation profile? Export it directly to our financial investment calculators.
                </div>
                <button
                  id="btn-send-to-roi"
                  onClick={() => onSendToROI(result.prediction.estimated_price, result.market_insights.estimated_monthly_rent)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>MODEL ROI IN CALC SUITE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isSubmitting && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
              <Loading message="Running scikit-learn standard scaling and scoring Decision Ensembles..." />
            </div>
          )}

          {/* Error indicator */}
          {error && (
            <div id="prediction-error" className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 p-4 rounded-xl text-rose-700 dark:text-rose-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Predictive Pipeline Error</h4>
                <p className="text-xs leading-relaxed mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Map Canvas Panel */}
        <div className="space-y-6">
          <Map
            selectedCity={selectedCity}
            selectedLocality={selectedLocality}
            onLocalitySelect={handleLocalitySelect}
          />
        </div>
      </div>
    </div>
  );
};
