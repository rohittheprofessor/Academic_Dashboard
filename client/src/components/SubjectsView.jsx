import React from 'react';
import { useActiveAssessment } from '../hooks/useActiveAssessment';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';
import { Target, AlertCircle, BarChart2, Hash } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const SubjectsView = () => {
  const { assessmentId, hasData } = useActiveAssessment();
  const { data: questions, isLoading } = useApi(assessmentId ? `/analytics/${assessmentId}/questions` : null);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasData || !questions) {
    return <div className="p-8 text-center text-slate-500">No question analytics data available.</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <Target className="text-slate-400" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">No Question Data</h3>
        <p className="text-slate-500 max-w-md">This assessment was uploaded without individual question marks or CO mappings. Question-level analytics cannot be generated.</p>
      </div>
    );
  }

  // Find hardest and easiest questions
  const sortedByDiff = [...questions].sort((a, b) => a.difficultyIndex - b.difficultyIndex);
  const hardest = sortedByDiff[0];
  const easiest = sortedByDiff[sortedByDiff.length - 1];
  const weakQuestions = questions.filter(q => q.weakFlag);

  const bloomsMapping = {
    'K1': { name: 'Remembering', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    'K2': { name: 'Understanding', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
    'K3': { name: 'Applying', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
    'K4': { name: 'Analyzing', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    'K5': { name: 'Evaluating', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
    'K6': { name: 'Creating', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">Question Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Difficulty index and performance per question.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center"><AlertCircle size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Weak Questions</p><p className="text-2xl font-extrabold">{weakQuestions.length}</p></div>
        </div>
        <div className="glass-card flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center"><Target size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Hardest Question</p><p className="text-2xl font-extrabold">{hardest?.questionNo || '-'}</p></div>
        </div>
        <div className="glass-card flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center"><BarChart2 size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Easiest Question</p><p className="text-2xl font-extrabold">{easiest?.questionNo || '-'}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-3xl p-6 border border-white/40 shadow-glass">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Difficulty Index Heatmap</h3>
          <p className="text-xs text-slate-500 mb-6">Lower index means the question was harder for the class. Items below 0.40 are flagged red.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                <XAxis dataKey="questionNo" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 1]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                />
                <Bar dataKey="difficultyIndex" name="Difficulty Index" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {questions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.weakFlag ? '#ef4444' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border border-white/40 shadow-glass">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Question List</h3>
           <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
             {questions.map(q => (
               <div key={q.questionNo} className={`p-4 rounded-2xl border ${q.weakFlag ? 'bg-red-50/50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' : 'bg-slate-50/50 border-slate-100 dark:bg-white/5 dark:border-white/10'} flex items-center justify-between`}>
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#141414] shadow-sm flex items-center justify-center font-black text-brand-600">{q.questionNo}</div>
                    <div>
                      <p className="text-sm font-bold">{q.averageScore} / {q.maxMarks} avg</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-500">Idx: {q.difficultyIndex}</p>
                        {q.bloomsLevel && bloomsMapping[q.bloomsLevel] && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${bloomsMapping[q.bloomsLevel].color}`}>
                            {q.bloomsLevel}: {bloomsMapping[q.bloomsLevel].name}
                          </span>
                        )}
                      </div>
                    </div>
                 </div>
                 {q.weakFlag && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Weak</span>}
               </div>
             ))}
           </div>
        </motion.div>
      </div>
    </div>
  );
};
