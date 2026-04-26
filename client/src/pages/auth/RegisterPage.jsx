import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Building2, Briefcase, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', department: '', designation: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/pending'), 3000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-[2.5rem] p-12 max-w-md text-center border border-emerald-500/20">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Registration Submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Your faculty account has been created. Please wait for Super Admin approval before you can log in.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 py-12">
      {/* Premium Background Mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl p-8 md:p-10 glass rounded-[2.5rem] z-10 mx-4 border border-white/40 dark:border-white/10 shadow-glass dark:shadow-glass-dark"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Faculty Registration</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Join the Internal Assessment Management System</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input type="text" name="name" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="Dr. John Doe" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input type="email" name="email" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="john@college.edu" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Mobile</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input type="tel" name="mobile" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" placeholder="+91 9876543210" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Department</label>
            <div className="relative group">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select name="department" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none">
                <option value="">Select Department</option>
                <option value="CSE">Computer Science & Engineering</option>
                <option value="IT">Information Technology</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="EE">Electrical Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Designation</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select name="designation" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none">
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input type={showPassword ? 'text' : 'password'} name="password" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" required onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Registration'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-slate-800 dark:text-white font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
