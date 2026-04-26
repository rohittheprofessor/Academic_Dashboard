import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PendingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="glass rounded-[2.5rem] p-12 max-w-md text-center border border-amber-500/20"
      >
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600 dark:text-amber-400 rotate-12 shadow-lg shadow-amber-500/20">
          <Clock size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-extrabold mb-3 text-slate-800 dark:text-white tracking-tight">Pending Approval</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
          Your faculty account is currently pending approval by the Super Admin. You will be able to log in once your identity and department are verified.
        </p>
        
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white hover:text-brand-500 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </motion.div>
    </div>
  );
};
