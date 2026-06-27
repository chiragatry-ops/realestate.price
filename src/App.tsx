import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Prediction } from './pages/Prediction';
import { Investment } from './pages/Investment';
import { ModelMetadata } from './types';
import { API_BASE } from './config';
import axios from 'axios';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Model Metadata
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  // Bridges the Valuation estimate straight into the Investment Calculator fields!
  const [bridgedPrice, setBridgedPrice] = useState<number | undefined>(undefined);
  const [bridgedRent, setBridgedRent] = useState<number | undefined>(undefined);

  // Sync state with HTML document classes for Tailwind Dark Mode support
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Model metrics from server on mount
  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/metrics`);
      if (response.data?.success) {
        setMetadata(response.data.metrics);
      }
    } catch (e) {
      console.warn('Could not fetch model metrics, using standard simulated baseline.', e);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleTriggerTrain = async () => {
    setIsTraining(true);
    try {
      // Simulate/Trigger hyperparameter tuning or retrain
      await new Promise(r => setTimeout(r, 2200));
      await fetchMetadata();
    } catch (e) {
      console.error('Training error:', e);
    } finally {
      setIsTraining(false);
    }
  };

  const handleSendToROI = (price: number, rent: number) => {
    setBridgedPrice(price);
    setBridgedRent(rent);
    setCurrentTab('investment');
  };

  const isTrained = metadata?.is_trained || false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Universal Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isTrained={isTrained}
      />

      {/* Primary Workspace Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {currentTab === 'home' && (
          <Home
            metadata={metadata}
            onTriggerTrain={handleTriggerTrain}
            isTraining={isTraining}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'prediction' && (
          <Prediction onSendToROI={handleSendToROI} />
        )}

        {currentTab === 'investment' && (
          <Investment initialPrice={bridgedPrice} initialRent={bridgedRent} />
        )}

      </main>

      {/* Universal Footer */}
      <Footer setCurrentTab={setCurrentTab} isTrained={isTrained} />
      
    </div>
  );
}
