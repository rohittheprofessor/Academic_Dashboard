import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export const StatCard = ({ title, value, suffix = "", subtitle, icon: Icon, trend, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
      className="glass-card glass-card-hover flex flex-col relative overflow-hidden group cursor-pointer"
    >
      {/* Decorative premium gradient mesh */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-brand-400/20 via-indigo-500/10 to-transparent rounded-full blur-3xl group-hover:bg-brand-500/30 transition-all duration-700 ease-in-out group-hover:scale-150"></div>

      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-brand-500 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
              trend > 0 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </motion.span>
        )}
      </div>

      <div className="z-10 relative mt-auto">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2 uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            <AnimatedCounter value={value} suffix={suffix} />
          </h2>
          {subtitle && <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{subtitle}</span>}
        </div>
      </div>
    </motion.div>
  );
};
