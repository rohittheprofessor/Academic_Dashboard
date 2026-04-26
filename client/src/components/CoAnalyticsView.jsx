import React from 'react';
import { useActiveAssessment } from '../hooks/useActiveAssessment';
import { useApi } from '../hooks/useApi';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const CoAnalyticsView = () => {
  const { assessmentId, hasData } = useActiveAssessment();
  const { data: coData, isLoading } = useApi(assessmentId ? `/analytics/${assessmentId}/co` : null);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasData || !coData) {
    return <div className="p-8 text-center text-slate-500">No CO analytics data available.</div>;
  }

  const achieved = coData.filter(c => c.status === 'Achieved').length;
  const weak = coData.filter(c => c.status === 'Weak').length;

  const getStatusColor = (status) => {
    if (status === 'Achieved') return '#10b981';
    if (status === 'Moderate') return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (status) => {
    if (status === 'Achieved') return <CheckCircle2 className="text-emerald-500" size={20} />;
    if (status === 'Moderate') return <AlertCircle className="text-amber-500" size={20} />;
    return <ShieldAlert className="text-red-500" size={20} />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">Course Outcomes</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Detailed attainment analysis mapped against curriculum standards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Target size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Achieved Outcomes</p><p className="text-2xl font-extrabold">{achieved} / {coData.length}</p></div>
        </div>
        <div className={`glass-card flex items-center gap-4 ${weak > 0 ? 'border-2 border-red-500/20' : ''}`}>
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${weak > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}><ShieldAlert size={24} /></div>
           <div><p className="text-sm font-bold text-slate-500">Weak Outcomes</p><p className="text-2xl font-extrabold">{weak}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-3xl p-6 border border-white/40 shadow-glass">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Attainment Levels</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                <XAxis dataKey="co" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                />
                <Bar dataKey="averagePercentage" name="Attainment %" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {coData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 border border-white/40 shadow-glass flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Status Breakdown</h3>
           <div className="flex-1 space-y-4">
             {coData.map(co => (
               <div key={co.co} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/40">
                 <div className="flex items-center gap-3">
                   {getStatusIcon(co.status)}
                   <div>
                     <p className="font-bold text-slate-800 dark:text-white">{co.co}</p>
                     <p className="text-xs text-slate-500 font-medium">{co.status}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-lg" style={{ color: getStatusColor(co.status) }}>{co.averagePercentage}%</p>
                 </div>
               </div>
             ))}
           </div>
        </motion.div>
      </div>
    </div>
  );
};
