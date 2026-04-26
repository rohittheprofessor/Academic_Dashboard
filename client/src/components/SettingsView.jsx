import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Building2, TrendingUp, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const SettingsView = () => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    instituteName: '',
    passThreshold: 40,
    coThresholds: { achieved: 70, moderate: 50 },
    gradeBoundaries: { O: 90, A_PLUS: 80, A: 70, B_PLUS: 60, B: 50, C: 40 }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
        setSettings(res.data);
      } catch (err) {
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          toast.error('Failed to load settings');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Super Admin') fetchSettings();
    else setLoading(false);
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'Super Admin') return toast.error('Only Super Admins can save global settings.');
    
    setSaving(true);
    try {
      await axios.put('/api/admin/settings', settings, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Global settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = (grade, value) => {
    setSettings(prev => ({
      ...prev,
      gradeBoundaries: { ...prev.gradeBoundaries, [grade]: Number(value) }
    }));
  };

  const handleCoChange = (level, value) => {
    setSettings(prev => ({
      ...prev,
      coThresholds: { ...prev.coThresholds, [level]: Number(value) }
    }));
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (user?.role !== 'Super Admin') {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Target className="text-slate-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Admin Privileges Required</h2>
        <p className="text-slate-500 max-w-md">Global threshold and grading settings can only be modified by a Super Admin. Please contact administration if boundaries need adjustment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">Global Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Configure calculation thresholds for the entire SmartEval platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Institute Branding */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-8 shadow-glass">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400"><Building2 size={24} /></div>
            <h3 className="text-xl font-bold">Institute Profile</h3>
          </div>
          <div className="max-w-md space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Institute Name</label>
            <input 
              type="text" 
              value={settings.instituteName}
              onChange={(e) => setSettings({...settings, instituteName: e.target.value})}
              className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Assessment Thresholds */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[2rem] p-8 shadow-glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400"><TrendingUp size={24} /></div>
              <h3 className="text-xl font-bold">Academic Thresholds</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Pass Percentage (%)</label>
                <input 
                  type="number" min="0" max="100"
                  value={settings.passThreshold}
                  onChange={(e) => setSettings({...settings, passThreshold: Number(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">CO Attainment Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-600">Achieved Min (%)</label>
                    <input type="number" min="0" max="100" value={settings.coThresholds.achieved} onChange={(e) => handleCoChange('achieved', e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-600">Moderate Min (%)</label>
                    <input type="number" min="0" max="100" value={settings.coThresholds.moderate} onChange={(e) => handleCoChange('moderate', e.target.value)} className="w-full bg-slate-50 dark:bg-[#141414]/50 border border-slate-200 dark:border-white/10 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grade Boundaries */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-[2rem] p-8 shadow-glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400"><Award size={24} /></div>
              <h3 className="text-xl font-bold">Grade Boundaries</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {Object.entries(settings.gradeBoundaries).map(([grade, val]) => (
                <div key={grade} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{grade.replace('_PLUS', '+')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">≥</span>
                    <input 
                      type="number" min="0" max="100" 
                      value={val}
                      onChange={(e) => handleGradeChange(grade, e.target.value)}
                      className="w-16 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-md py-1.5 px-2 text-sm text-center focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" /> : <Save size={20} />}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
