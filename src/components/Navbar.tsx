import React from 'react';
import { Home, Compass, BarChart3, Moon, Sun, ShieldAlert, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isTrained: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  isTrained
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'prediction', label: 'AI Valuation', icon: Compass },
    { id: 'investment', label: 'Investment ROI', icon: BarChart3 },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors duration-200">
      <div id="navbar-inner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div
            id="brand-logo-container"
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setCurrentTab('home')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 text-white">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                VALUATE<span className="text-emerald-500 font-semibold text-sm tracking-widest uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">AI</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">
                PREDICTIVE ANALYTICS ENGINE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Accessories (Model Status, Theme Selector) */}
          <div id="navbar-actions" className="flex items-center gap-3">
            {/* Engine Status Tag */}
            <div
              id="model-status-badge"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
                isTrained
                  ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isTrained ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              {isTrained ? 'ML_MODEL_ONLINE_GB' : 'HEURISTIC_SOLVER_ACTIVE'}
            </div>

            {/* Dark Mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
