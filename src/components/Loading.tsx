import React from 'react';
import { motion } from 'motion/react';
import { Home, Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Analyzing property dynamics...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div id="loading-container" className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[300px]">
      <div className="relative mb-6">
        {/* Decorative Ring */}
        <motion.div
          id="loading-ring-outer"
          className="absolute -inset-4 rounded-full border border-emerald-500/10 dark:border-emerald-400/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        <motion.div
          id="loading-ring-inner"
          className="absolute -inset-2 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-emerald-500/20 border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Home Icon Pulsing */}
        <div id="loading-icon-bg" className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
          <motion.div
            id="loading-icon-motion"
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Home className="w-8 h-8" />
          </motion.div>
        </div>
      </div>

      <motion.p
        id="loading-message"
        className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {message}
      </motion.p>
      
      <motion.p
        id="loading-subtext"
        className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-xs font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Processing mathematical features & scoring AI ensembles...
      </motion.p>
    </div>
  );
};
