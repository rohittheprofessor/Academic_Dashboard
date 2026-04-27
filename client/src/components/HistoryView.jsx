import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { Search, History, Calendar, Users, Activity, ExternalLink, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export const HistoryView = () => {
  const navigate = useNavigate();
  const { data: allAssessments, isLoading } = useApi('/assessments');
  const [searchTerm, setSearchTerm] = useState('');

  const sessionStr = localStorage.getItem('activeClassSession');
  const session = sessionStr ? JSON.parse(sessionStr) : null;

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold animate-pulse">Loading History...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass p-12 rounded-[2rem] max-w-md">
          <h2 className="text-2xl font-bold mb-2">No Session Selected</h2>
          <p className="text-slate-500">Please select a class session to view data history.</p>
        </div>
      </div>
    );
  }

  // Filter assessments that match the chosen context
  const matched = (allAssessments || []).filter(a => 
    a.metadata?.semester === session.semester &&
    a.metadata?.section === session.section &&
    a.metadata?.program === session.branch &&
    a.metadata?.courseId === session.subject &&
    a.metadata?.sessionYear === session.academicYear
  );

  // Sort by date descending
  matched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredAssessments = matched.filter(a => 
    a.metadata?.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.metadata?.testType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAnalytics = (id) => {
    localStorage.setItem('selectedAssessmentId', id);
    navigate('/dashboard/overview');
    // Force a small reload or state update if needed, but navigate might be enough
    // if useActiveAssessment remounts or we trigger an event.
    // To ensure the hook re-runs, we might need to dispatch an event, 
    // but React Router's navigate to the same route might not remount. 
    // Wait, navigate goes to '/dashboard/overview'. History is '/dashboard/history'.
    // So it WILL mount DashboardView and trigger useActiveAssessment.
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'CT': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Internal': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
      case 'Makeup': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'External': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white flex items-center gap-3">
            <History className="text-brand-500" size={28} />
            Data History
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">View and manage previously uploaded assessment data for this class.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass bg-white/50 dark:bg-[#141414]/50 border-white/40 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all shadow-sm"
          />
        </div>
      </div>

      {filteredAssessments.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-16 text-center border border-slate-200 dark:border-white/10">
          <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Uploads Found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't uploaded any data matching your search for this class session yet.</p>
          <button onClick={() => navigate('/dashboard/upload')} className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors inline-flex items-center gap-2 shadow-lg">
            Upload New Data <ArrowRight size={18} />
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl border border-white/40 dark:border-white/10 shadow-glass dark:shadow-glass-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Test Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Students</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Performance</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredAssessments.map((assessment, index) => (
                  <tr key={assessment._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
                          <Tag size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 dark:text-white">{assessment.metadata?.testName || `Test ${assessment.metadata?.examSequence}`}</p>
                            {index === 0 && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wide uppercase">Latest</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getBadgeColor(assessment.metadata?.testType)}`}>
                              {assessment.metadata?.testType || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-500">{assessment.metadata?.courseId} • Sec {assessment.metadata?.section}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="text-slate-400 text-xs ml-1 flex items-center gap-1"><Clock size={12}/> {new Date(assessment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                        <Users size={14} className="text-slate-500" />
                        <span className="text-sm font-bold">{assessment.analytics?.totalStudents || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-sm font-black ${assessment.analytics?.passPercentage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {assessment.analytics?.passPercentage || 0}% Pass
                        </span>
                        <span className="text-xs text-slate-500 font-medium mt-0.5">Avg: {assessment.analytics?.averageTotal || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewAnalytics(assessment._id)}
                        className="inline-flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-500 dark:hover:bg-brand-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 -translate-x-2 group-hover:translate-x-0"
                      >
                        View Analytics <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};
