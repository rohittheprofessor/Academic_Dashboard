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

  const needsAttention = data.studentComparisons.filter(s => s.targetScore < 40);

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
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Needs Attention (&lt; 40%)</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {needsAttention.length > 0 ? needsAttention.map((s, i) => (
              <div key={s.rollNo} className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10">
                 <div className="flex items-center gap-3">
                   <span className="font-black text-red-600 opacity-50">#{i+1}</span>
                   <div>
                     <p className="font-bold text-slate-800 dark:text-white">{s.name}</p>
                     <p className="text-xs text-slate-500">{s.rollNo}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-red-600 dark:text-red-400">{s.targetScore}%</p>
                   <p className="text-xs text-slate-500">Target Score</p>
                 </div>
              </div>
            )) : <p className="text-sm text-slate-500">No students below 40%.</p>}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl border border-white/40 shadow-glass overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Full Class Comparison</h3>
          <span className="bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 px-3 py-1 rounded-full text-xs font-bold">
            {data.studentComparisons.length} Students
          </span>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-[#1a1a1a]/80 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Roll No</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Student Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">{data.baselineName} Score</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">{data.targetName} Score</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Net Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.studentComparisons.map((s) => (
                <tr key={s.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{s.rollNo}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{s.name}</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-600 dark:text-slate-300">{s.baselineScore}%</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-white">
                    {s.targetScore}%
                    {s.targetScore < 40 && <span className="ml-2 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Attention</span>}
                  </td>
                  <td className="px-6 py-4 text-right font-black">
                    <span className={`px-2.5 py-1 rounded-lg text-xs ${s.improvement > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : s.improvement < 0 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-400'}`}>
                      {s.improvement > 0 ? '+' : ''}{s.improvement}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
