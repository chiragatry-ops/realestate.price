import React, { useState } from 'react';
import { PredictionInput } from '../types';
import { MapPin, Sliders, Shield, Award, Sparkles, Building2, HelpCircle } from 'lucide-react';

interface PredictionFormProps {
  onSubmit: (data: PredictionInput) => void;
  isSubmitting: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isSubmitting }) => {
  // Setup nice state matching the required schema
  const [inputs, setInputs] = useState<PredictionInput>({
    Area: 1850,
    Bedrooms: 3,
    Bathrooms: 2,
    Parking: 1,
    Age: 10,
    LocationScore: 7.5,
    MetroDistance: 2.5,
    SchoolDistance: 1.5,
    HospitalDistance: 3.0,
    CrimeRate: 1.2,
    PopulationDensity: 4500,
    City: 'Chicago',
    Locality: 'Downtown',
    PropertyType: 'Apartment',
    Furnishing: 'Semi-Furnished',
  });

  const presetProfiles = [
    {
      name: 'Luxury Penthouse (New York)',
      desc: 'Premium high-rise in Manhattan',
      data: {
        Area: 3200, Bedrooms: 4, Bathrooms: 3.5, Parking: 2, Age: 2, LocationScore: 9.8,
        MetroDistance: 0.2, SchoolDistance: 0.5, HospitalDistance: 1.0, CrimeRate: 0.3,
        PopulationDensity: 12000, City: 'New York', Locality: 'Waterfront', PropertyType: 'Penthouse', Furnishing: 'Fully Furnished'
      }
    },
    {
      name: 'Suburban Family Home (LA)',
      desc: 'Spacious yard, quiet neighborhood',
      data: {
        Area: 2400, Bedrooms: 4, Bathrooms: 3, Parking: 2, Age: 15, LocationScore: 8.0,
        MetroDistance: 4.5, SchoolDistance: 1.2, HospitalDistance: 2.8, CrimeRate: 0.8,
        PopulationDensity: 2800, City: 'Los Angeles', Locality: 'Suburbs', PropertyType: 'Single-Family', Furnishing: 'Semi-Furnished'
      }
    },
    {
      name: 'Urban Starter Apartment (Chicago)',
      desc: 'Transit-friendly waterfront flat',
      data: {
        Area: 950, Bedrooms: 1, Bathrooms: 1, Parking: 0, Age: 8, LocationScore: 8.5,
        MetroDistance: 0.6, SchoolDistance: 0.8, HospitalDistance: 1.5, CrimeRate: 1.4,
        PopulationDensity: 8500, City: 'Chicago', Locality: 'Waterfront', PropertyType: 'Apartment', Furnishing: 'Unfurnished'
      }
    }
  ];

  const handleChange = (key: keyof PredictionInput, value: any) => {
    setInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePresetSelect = (profileData: PredictionInput) => {
    setInputs(profileData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
  const localities = ['Downtown', 'Suburbs', 'Uptown', 'Waterfront', 'Westside', 'Eastside'];
  const propertyTypes = ['Apartment', 'Condo', 'Single-Family', 'Townhouse', 'Penthouse'];
  const furnishings = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];

  return (
    <form id="prediction-interactive-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Preset profiles widget */}
      <div id="preset-selector-section" className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Or Load Pre-configured Profiles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {presetProfiles.map((p, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-btn-${idx}`}
              onClick={() => handlePresetSelect(p.data as PredictionInput)}
              className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-sm transition-all text-xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Geography & Classification */}
        <div id="form-geography-card" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Location & Classification</h3>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Metropolitan</label>
            <select
              id="input-city"
              value={inputs.City}
              onChange={(e) => handleChange('City', e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Locality */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Neighborhood Locality</label>
            <select
              id="input-locality"
              value={inputs.Locality}
              onChange={(e) => handleChange('Locality', e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {localities.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Property Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Architectural Typology</label>
            <select
              id="input-property-type"
              value={inputs.PropertyType}
              onChange={(e) => handleChange('PropertyType', e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Furnishing Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Furnishing Delivery State</label>
            <div className="grid grid-cols-3 gap-1.5">
              {furnishings.map((f) => (
                <button
                  type="button"
                  key={f}
                  id={`furnishing-btn-${f.replace(/\s+/g, '-')}`}
                  onClick={() => handleChange('Furnishing', f)}
                  className={`py-2 px-1 text-[11px] font-medium rounded-lg text-center border truncate transition-all ${
                    inputs.Furnishing === f
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Physical Metrics */}
        <div id="form-physical-card" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-500">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Physical Specifications</h3>
          </div>

          {/* Area */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Gross Floor Area</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-300 font-bold">{inputs.Area.toLocaleString()} SQFT</span>
            </div>
            <input
              id="range-area"
              type="range"
              min={300}
              max={8000}
              step={50}
              value={inputs.Area}
              onChange={(e) => handleChange('Area', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bedrooms</label>
              <div className="flex items-center">
                <button
                  type="button"
                  id="btn-bedrooms-dec"
                  disabled={inputs.Bedrooms <= 1}
                  onClick={() => handleChange('Bedrooms', inputs.Bedrooms - 1)}
                  className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-l-xl text-slate-600 dark:text-slate-300 disabled:opacity-40"
                >
                  -
                </button>
                <div id="display-bedrooms" className="flex-1 text-center font-mono font-bold text-sm h-9 flex items-center justify-center bg-slate-50/40 dark:bg-slate-800/20 border-y border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                  {inputs.Bedrooms}
                </div>
                <button
                  type="button"
                  id="btn-bedrooms-inc"
                  disabled={inputs.Bedrooms >= 10}
                  onClick={() => handleChange('Bedrooms', inputs.Bedrooms + 1)}
                  className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-r-xl text-slate-600 dark:text-slate-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bathrooms</label>
              <div className="flex items-center">
                <button
                  type="button"
                  id="btn-bathrooms-dec"
                  disabled={inputs.Bathrooms <= 1}
                  onClick={() => handleChange('Bathrooms', Math.max(1, inputs.Bathrooms - 0.5))}
                  className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-l-xl text-slate-600 dark:text-slate-300 disabled:opacity-40"
                >
                  -
                </button>
                <div id="display-bathrooms" className="flex-1 text-center font-mono font-bold text-sm h-9 flex items-center justify-center bg-slate-50/40 dark:bg-slate-800/20 border-y border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                  {inputs.Bathrooms}
                </div>
                <button
                  type="button"
                  id="btn-bathrooms-inc"
                  disabled={inputs.Bathrooms >= 8}
                  onClick={() => handleChange('Bathrooms', Math.min(8, inputs.Bathrooms + 0.5))}
                  className="w-9 h-9 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-r-xl text-slate-600 dark:text-slate-300"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Parking & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Parking slots</label>
              <select
                id="input-parking"
                value={inputs.Parking}
                onChange={(e) => handleChange('Parking', Number(e.target.value))}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              >
                {[0, 1, 2, 3, 4].map(v => <option key={v} value={v}>{v} slots</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Property Age</label>
              <select
                id="input-age"
                value={inputs.Age}
                onChange={(e) => handleChange('Age', Number(e.target.value))}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              >
                {[0, 1, 2, 5, 8, 10, 15, 20, 30, 40, 50].map(v => (
                  <option key={v} value={v}>
                    {v === 0 ? 'Brand New' : `${v} years`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Population Density */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Population Density</span>
              <span className="font-mono text-slate-400 text-[10px]">{inputs.PopulationDensity.toLocaleString()} ppl/km²</span>
            </div>
            <input
              id="range-population-density"
              type="range"
              min={500}
              max={15000}
              step={500}
              value={inputs.PopulationDensity}
              onChange={(e) => handleChange('PopulationDensity', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>
        </div>

        {/* Step 3: Spatial & Amenities */}
        <div id="form-amenities-card" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Aesthetic & Infrastructure</h3>
          </div>

          {/* Location Score */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Desirability Score</span>
              <span className="font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[11px] font-bold">{inputs.LocationScore.toFixed(1)} / 10.0</span>
            </div>
            <input
              id="range-location-score"
              type="range"
              min={1.0}
              max={10.0}
              step={0.1}
              value={inputs.LocationScore}
              onChange={(e) => handleChange('LocationScore', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Distances (Metro, School, Hospital) */}
          <div className="space-y-3.5">
            {/* Metro */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Distance to Metro Link</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">{inputs.MetroDistance.toFixed(1)} km</span>
              </div>
              <input
                id="range-metro-distance"
                type="range"
                min={0.1}
                max={15.0}
                step={0.1}
                value={inputs.MetroDistance}
                onChange={(e) => handleChange('MetroDistance', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* School */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Distance to Grade Schools</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">{inputs.SchoolDistance.toFixed(1)} km</span>
              </div>
              <input
                id="range-school-distance"
                type="range"
                min={0.1}
                max={10.0}
                step={0.1}
                value={inputs.SchoolDistance}
                onChange={(e) => handleChange('SchoolDistance', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Hospital */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Distance to Hospitals</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold">{inputs.HospitalDistance.toFixed(1)} km</span>
              </div>
              <input
                id="range-hospital-distance"
                type="range"
                min={0.1}
                max={12.0}
                step={0.1}
                value={inputs.HospitalDistance}
                onChange={(e) => handleChange('HospitalDistance', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Crime Rate */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Neighborhood Crime Rate</span>
              <span className="font-mono text-rose-500 dark:text-rose-400 text-[11px] font-bold">{inputs.CrimeRate.toFixed(2)} %</span>
            </div>
            <input
              id="range-crime-rate"
              type="range"
              min={0.0}
              max={5.0}
              step={0.05}
              value={inputs.CrimeRate}
              onChange={(e) => handleChange('CrimeRate', Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Submission CTA */}
      <div id="submit-action-container" className="flex items-center justify-end">
        <button
          id="btn-evaluate-property"
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/15 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>RUNNING GRADIENT BOOST SCORING...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-100 animate-pulse" />
              <span>GENERATE COMPREHENSIVE VALUATION</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
