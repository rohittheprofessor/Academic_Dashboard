import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useData } from '../../context/DataContext';

export const StudentProfileModal = ({ student, isOpen, onClose }) => {
  const { data } = useData();

  const studentFullData = useMemo(() => {
    if (!student || !data) return null;
    // Find all records for this student (in case they have multiple subjects, though our flat structure assumes 1 row = 1 student/subject combo, but let's handle if it's aggregated)
    // For this dashboard, typically 1 row is the student's final result, but let's build a radar of their performance against averages.
    
    // Calculate global averages for comparison
    let sessionalAvg = 0;
    let finalAvg = 0;
    let totalAvg = 0;
    
    data.forEach(d => {
      sessionalAvg += Number(d.sessional || 0);
      finalAvg += Number(d.final || 0);
      totalAvg += Number(d.percentage || 0);
    });
    
    sessionalAvg /= data.length;
    finalAvg /= data.length;
    totalAvg /= data.length;

    const radarData = [
      { subject: 'Sessional', A: student.sessional, B: sessionalAvg, fullMark: 100 },
      { subject: 'Final', A: student.final, B: finalAvg, fullMark: 100 },
      { subject: 'Overall', A: student.percentage, B: totalAvg, fullMark: 100 },
    ];

    return { radarData, sessionalAvg, finalAvg, totalAvg };

  }, [student, data]);

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#141414] w-full max-w-3xl rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20 dark:border-white/10"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/20 blur-3xl rounded-full"></div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/10 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-400 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-brand-500/30">
                {student.name ? student.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{student.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><BookOpen size={16} /> {student.subject || 'General'}</span>
                  <span className="flex items-center gap-1">Roll No: {student.rollNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm text-slate-500 mb-1">Total Score</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{student.percentage}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm text-slate-500 mb-1">Rank</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">#{student.rank}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm text-slate-500 mb-1">Grade</p>
                    <p className={`text-3xl font-bold ${student.grade === 'F' ? 'text-red-500' : 'text-emerald-500'}`}>{student.grade}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-sm text-slate-500 mb-1">Sessional / Final</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-white">{student.sessional} / {student.final}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">AI Insight</h3>
                <div className={`p-4 rounded-2xl border flex gap-4 ${student.percentage >= 70 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' : 'bg-red-50/50 border-red-100 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300'}`}>
                   <div className="shrink-0 mt-0.5">
                     {student.percentage >= 70 ? <TrendingUp size={20} /> : <AlertTriangle size={20} />}
                   </div>
                   <p className="text-sm font-medium leading-relaxed">
                     {student.percentage >= 70 
                       ? `${student.name} is performing excellently, ranking in the top percentiles. Consistent high marks across both sessional and final exams.`
                       : `${student.name} needs attention. A score of ${student.percentage}% indicates a lack of fundamental understanding in ${student.subject}. Recommended remedial classes.`
                     }
                   </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Performance vs Average</h3>
              <div className="h-[300px] w-full bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 p-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={studentFullData.radarData}>
                    <PolarGrid stroke="#94a3b8" opacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Student" dataKey="A" stroke="#0ea5e9" strokeWidth={2} fill="#0ea5e9" fillOpacity={0.5} />
                    <Radar name="Class Avg" dataKey="B" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div> Student</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8b5cf6] opacity-50"></div> Class Average</div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
