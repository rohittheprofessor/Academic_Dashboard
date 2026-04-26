import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Building, Users, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ClassSetupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sessionData, setSessionData] = useState({
    academicYear: '',
    branch: '',
    semester: '',
    section: '',
    subject: ''
  });

  const handleChange = (e) => setSessionData({ ...sessionData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save selection to context or localStorage so dashboard knows the context
    localStorage.setItem('activeClassSession', JSON.stringify(sessionData));
    navigate('/dashboard/overview');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 py-12">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl p-8 md:p-12 glass rounded-[2.5rem] z-10 mx-4 border border-white/40 shadow-glass"
      >
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-brand-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30 mb-6">
             <BookOpen className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome, {user?.name}</h1>
          <p className="text-slate-500 font-medium">Please select the class and subject context to proceed to the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Academic Year</label>
            <div className="relative group">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select name="academicYear" required onChange={handleChange} className="w-full bg-white dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none shadow-sm">
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Branch</label>
            <div className="relative group">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select name="branch" required onChange={handleChange} className="w-full bg-white dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none shadow-sm">
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="AI/DS">AI/DS</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Semester</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select name="semester" required onChange={handleChange} className="w-full bg-white dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none shadow-sm">
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Sem ${s}`}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Section</label>
            <div className="relative group">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <select name="section" required onChange={handleChange} className="w-full bg-white dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none shadow-sm">
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Subject</label>
            <div className="relative group">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
              <input type="text" name="subject" required onChange={handleChange} placeholder="e.g. Data Structures, Computer Networks..." className="w-full bg-white dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-sm" />
            </div>
          </div>

          <div className="md:col-span-2 mt-6">
            <button 
              type="submit" 
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Enter Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
