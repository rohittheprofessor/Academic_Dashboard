import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      if (result.user.role === 'Super Admin') {
        navigate('/admin');
      } else {
        const hasSession = localStorage.getItem('activeClassSession');
        navigate(hasSession ? '/dashboard/overview' : '/dashboard/setup');
      }
    } else {
      if (result.message.includes('Pending') || result.message.includes('pending')) {
        navigate('/pending');
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100">
      {/* Premium Background Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass rounded-[2.5rem] z-10 mx-4 border border-white/40 dark:border-white/10 shadow-glass dark:shadow-glass-dark"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-brand-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30 mb-6">
             <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Log in to SmartEval Analytics</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner-light dark:shadow-inner-dark"
                placeholder="teacher@college.edu"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-inner-light dark:shadow-inner-dark"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500/50 bg-slate-100 border-slate-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Are you a new faculty member?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
