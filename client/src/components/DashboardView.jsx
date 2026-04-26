import React from 'react';
import { useActiveAssessment } from '../hooks/useActiveAssessment';
import { useApi } from '../hooks/useApi';
import { StatCard } from './dashboard/StatCard';
import { Users, CheckCircle, TrendingUp, AlertTriangle, Trophy, BookOpen, Download, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { exportToPDF } from '../utils/export';

export const DashboardView = () => {
  const { assessmentId, loading: resolveLoading, hasData } = useActiveAssessment();
  
  const { data: overview, isLoading: loadingOverview } = useApi(assessmentId ? `/analytics/${assessmentId}/overview` : null);
  const { data: coData, isLoading: loadingCo } = useApi(assessmentId ? `/analytics/${assessmentId}/co` : null);

  if (resolveLoading || loadingOverview || loadingCo) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
         <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
           <p className="text-slate-500 font-semibold animate-pulse">Loading Analytics Engine...</p>
         </div>
      </div>
    );
  }

  if (!hasData || !overview) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
         <div className="text-center glass p-12 rounded-[2rem] max-w-md">
           <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
             <BookOpen size={32} />
           </div>
           <h2 className="text-2xl font-bold mb-2">No Assessments Found</h2>
           <p className="text-slate-500">There is no data uploaded for this class session yet. Please navigate to the Upload tab to parse your ERP excel sheet.</p>
         </div>
      </div>
    );
  }

  // Map CO status to colors
  const getStatusColor = (status) => {
    if (status === 'Achieved') return '#10b981'; // Emerald
    if (status === 'Moderate') return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div id="dashboard-view-container" className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Key performance indicators across all uploaded records.</p>
        </div>
        <button 
          onClick={() => {
            const el = document.getElementById('dashboard-view-container');
            if(el) exportToPDF(el, 'dashboard_report.pdf');
          }}
          className="flex items-center gap-2 glass bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm"
        >
          <Download size={16} className="text-brand-500" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={overview.totalStudents} icon={Users} index={0} />
        <StatCard title="Pass Percentage" value={overview.passPercentage} suffix="%" subtitle={`(${Math.round((overview.passPercentage/100) * overview.appearedStudents)} passed)`} icon={CheckCircle} trend={overview.passPercentage > 50 ? 5.2 : -2.1} index={1} />
        <StatCard title="Average Score" value={overview.averageTotal} suffix="" icon={Activity} index={2} />
        <StatCard title="Highest Score" value={overview.highestTotal} suffix="" icon={Trophy} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-3xl p-6 border border-white/40 dark:border-white/10 shadow-glass dark:shadow-glass-dark relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full group-hover:bg-brand-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Target className="text-brand-500" size={20} />
              Course Outcome Attainment
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="co" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Bar dataKey="averagePercentage" name="Attainment %" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {coData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6 border border-white/40 dark:border-white/10 shadow-glass dark:shadow-glass-dark flex flex-col relative overflow-hidden group"
        >
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          <div className="relative z-10 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-indigo-500" size={20} />
              Smart Insights
            </h3>
            
            <div className="flex-1 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Standard Deviation</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{overview.standardDeviation}</p>
                <p className="text-xs text-slate-500 mt-1">Class variance metric</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Class Median</p>
                <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{overview.medianTotal}</p>
                <p className="text-xs text-slate-500 mt-1">Midpoint score of the class</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 mt-auto">
                 <p className="text-sm font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
                   {overview.passPercentage < 60 
                     ? `The class pass percentage is low (${overview.passPercentage}%). Recommend reviewing weak Course Outcomes.`
                     : `The class is performing well with an average of ${overview.averageTotal} marks.`}
                 </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
