import React, { useState } from 'react';
import { useActiveAssessment } from '../hooks/useActiveAssessment';
import { useApi } from '../hooks/useApi';
import { Search, Download, Filter, Eye, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { exportToPDF } from '../utils/export';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentsView = () => {
  const { assessmentId, hasData } = useActiveAssessment();
  const { data: students, isLoading } = useApi(assessmentId ? `/analytics/${assessmentId}/students` : null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasData || !students) {
    return <div className="p-8 text-center text-slate-500">No student data available.</div>;
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const currentStudents = filteredStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getGradeColor = (grade) => {
    if (['O', 'A+', 'A'].includes(grade)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
    if (['B+', 'B'].includes(grade)) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    if (grade === 'C') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6" id="student-rank-table">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">Student Ranks</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Detailed performance metrics for {students.length} students.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or roll no..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm w-64"
            />
          </div>
          <button className="p-2 glass rounded-xl border border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm">
            <Filter size={18} />
          </button>
          <button onClick={() => exportToPDF(document.getElementById('student-rank-table'), 'RankList.pdf')} className="flex items-center gap-2 glass bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm text-brand-600 dark:text-brand-400">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="glass rounded-[2rem] border border-white/40 dark:border-white/10 shadow-glass dark:shadow-glass-dark overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 dark:bg-[#141414]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Rank</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Roll No</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Student Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Total Marks</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Percentage</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Grade</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Result</th>
                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence>
                {currentStudents.map((student, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    key={student._id} 
                    className="hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {student.rank <= 3 && <Award size={16} className={student.rank === 1 ? 'text-amber-500' : student.rank === 2 ? 'text-slate-400' : 'text-amber-700'} />}
                        <span className={`font-black ${student.rank <= 3 ? 'text-lg' : 'text-slate-500 dark:text-slate-400'}`}>{student.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{student.rollNo}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{student.name}</td>
                    <td className="px-6 py-4 font-black">{student.totalMarks}</td>
                    <td className="px-6 py-4 font-bold text-brand-600 dark:text-brand-400">{student.percentage}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getGradeColor(student.grade)}`}>{student.grade}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 font-bold text-xs ${student.passFailStatus === 'Pass' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {student.passFailStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">No students found matching your search.</div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-50/80 dark:bg-[#141414]/80 p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredStudents.length)} of {filteredStudents.length} entries</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
              ><ChevronLeft size={16} /></button>
              <span className="text-xs font-bold px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
              ><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
