import React from 'react';
import { useActiveAssessment } from '../hooks/useActiveAssessment';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, Zap, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export const ComparisonView = () => {
  const { assessmentId, hasData } = useActiveAssessment();
  const { data: comparison, isLoading } = useApi(assessmentId ? `/analytics/compare/${assessmentId}` : null);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasData || !comparison || !comparison.exists) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-[60vh]">
         <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
           <Target className="text-slate-400" size={32} />
         </div>
         <h2 className="text-2xl font-bold mb-2">No Comparison Baseline Found</h2>
         <p className="max-w-md">The system could not find a previous CT or assessment to compare against for this specific subject and section. Comparisons will unlock automatically once a second assessment is uploaded.</p>
      </div>
    );
  }

  const { data } = comparison;

  // Prepare chart data (top 10 students for visual clarity)
  const chartData = data.studentComparisons.slice(0, 15).map(s => ({
    name: s.name.split(' ')[0], // First name
    baseline: s.baselineScore,
    target: s.targetScore,
    diff: s.improvement
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white flex items-center gap-3">
          <span className="bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-lg text-xl">{data.baselineName}</span> 
          <ArrowRight className="text-slate-400" size={24} /> 
          <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-lg text-xl">{data.targetName}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">Class improvement analytics based on {data.totalCompared} matched students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`glass-card flex items-center gap-4 border-2 ${data.classImprovementPercent > 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${data.classImprovementPercent > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
             <Zap size={24} />
           </div>
           <div><p className="text-sm font-bold text-slate-500">Net Class Improvement</p><p className="text-2xl font-extrabold">{data.classImprovementPercent > 0 ? '+' : ''}{data.classImprovementPercent}%</p></div>
        </div>
        <div className="glass-card flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><TrendingUp size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Students Improved</p><p className="text-2xl font-extrabold">{data.improverCount}</p></div>
        </div>
        <div className="glass-card flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><TrendingDown size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Students Declined</p><p className="text-2xl font-extrabold">{data.declinedCount}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-6 border border-white/40 shadow-glass">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Top Improvers</h3>
          <div className="space-y-3">
            {data.topImprovers.map((s, i) => (
              <div key={s.rollNo} className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                 <div className="flex items-center gap-3">
                   <span className="font-black text-emerald-600 opacity-50">#{i+1}</span>
                   <div>
                     <p className="font-bold text-slate-800 dark:text-white">{s.name}</p>
                     <p className="text-xs text-slate-500">{s.rollNo}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-emerald-600 dark:text-emerald-400">+{s.improvement}%</p>
                   <p className="text-xs text-slate-500">{s.baselineScore}% → {s.targetScore}%</p>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border border-white/40 shadow-glass">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Needs Attention</h3>
          <div className="space-y-3">
            {data.topDeclined.map((s, i) => (
              <div key={s.rollNo} className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10">
                 <div className="flex items-center gap-3">
                   <span className="font-black text-red-600 opacity-50">#{i+1}</span>
                   <div>
                     <p className="font-bold text-slate-800 dark:text-white">{s.name}</p>
                     <p className="text-xs text-slate-500">{s.rollNo}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-red-600 dark:text-red-400">{s.improvement}%</p>
                   <p className="text-xs text-slate-500">{s.baselineScore}% → {s.targetScore}%</p>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
