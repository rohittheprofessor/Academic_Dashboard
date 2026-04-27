import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, FileSpreadsheet, ArrowRight, Save, ShieldAlert } from 'lucide-react';
import { parseERPExcel } from '../../utils/erpParser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ErpUploadFlow = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  
  // Parsed Data State
  const [parsedMetadata, setParsedMetadata] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [questionCols, setQuestionCols] = useState([]);
  
  // CO Mapping State { 'Q1': { co: 'CO1', maxMarks: 5 } }
  const [coMappings, setCoMappings] = useState({});
  const [saving, setSaving] = useState(false);

  // STEP 1: Handle File Drop
  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError("Please upload a valid Excel or CSV file.");
      return;
    }

    try {
      const data = await parseERPExcel(file);
      setParsedMetadata(data.metadata);
      setParsedStudents(data.studentRecords);
      setQuestionCols(data.questionColumns);
      
      // Initialize default CO mappings using detected max marks
      const initMappings = {};
      data.questionColumns.forEach(q => {
        initMappings[q] = { co: 'CO1', maxMarks: data.maxMarksMap ? data.maxMarksMap[q] || 5 : 5 }; // defaults
      });
      setCoMappings(initMappings);
      
      setStep(2); // Move to Preview Step
    } catch (err) {
      setError(err.message);
    }
  };

  // STEP 5: Save to Backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const classContext = JSON.parse(localStorage.getItem('activeClassSession') || '{}');
      
      // Merge ERP metadata with Dashboard Context mapped to schema fields
      const tName = (parsedMetadata.testName || 'Internal Assessment').toUpperCase();
      let testType = 'Internal';
      let examSequence = 1;
      
      if (tName.includes('CT')) {
        testType = 'CT';
        const match = tName.match(/CT[\s-]*(\d+)/);
        if (match) examSequence = parseInt(match[1]);
      } else if (tName.includes('MAKEUP')) {
        testType = 'Makeup';
      } else if (tName.includes('EXTERNAL')) {
        testType = 'External';
      }

      const finalMetadata = {
        ...parsedMetadata,
        sessionYear: classContext.academicYear || parsedMetadata.session,
        program: classContext.branch || parsedMetadata.program,
        semester: classContext.semester || parsedMetadata.semester,
        section: classContext.section || parsedMetadata.section,
        courseId: classContext.subject || parsedMetadata.course,
        testName: parsedMetadata.testName || 'Internal Assessment',
        testType,
        examSequence
      };

      const payload = {
        metadata: finalMetadata,
        coMappings: Object.entries(coMappings).map(([q, val]) => ({ questionNo: q, ...val })),
        studentRecords: parsedStudents
      };

      await axios.post('/api/assessments', payload, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success('Assessment processed and saved successfully!', { icon: '🚀' });
      navigate('/dashboard/overview');

    } catch (err) {
      console.error(err);
      toast.error('Failed to save assessment to database.');
      setError("Failed to save assessment to database.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-white/10 -z-10"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 transition-all duration-500 -z-10" style={{ width: `${(step - 1) * 25}%` }}></div>
        
        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Metadata' },
          { num: 3, label: 'Preview' },
          { num: 4, label: 'CO Map' },
          { num: 5, label: 'Save' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
              ${step >= s.num ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-400 border border-slate-200 dark:border-white/10'}`}
            >
              {step > s.num ? <CheckCircle2 size={20} /> : s.num}
            </div>
            <span className={`text-xs font-semibold ${step >= s.num ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} /> <span className="font-semibold text-sm">{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-brand-500 dark:hover:border-brand-500 transition-colors"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
        >
          <div className="w-24 h-24 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-500">
            <FileSpreadsheet size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-extrabold mb-3">Upload ERP Excel Sheet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Drag and drop the result Excel file generated by your college ERP system, or click to browse.</p>
          <input type="file" id="file-upload" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileDrop} />
          <label htmlFor="file-upload" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg hover:-translate-y-0.5 inline-block">
            Browse Files
          </label>
        </motion.div>
      )}

      {/* STEP 2: METADATA CONFIRMATION */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2rem] p-8 border border-white/40">
          <h2 className="text-2xl font-extrabold mb-6">Detected Assessment Metadata</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(parsedMetadata).map(([key, value]) => (
              <div key={key} className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <input 
                  type="text" 
                  value={value || ''} 
                  onChange={(e) => setParsedMetadata({...parsedMetadata, [key]: e.target.value})}
                  className="w-full bg-transparent font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-white/10 focus:outline-none focus:border-brand-500" 
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4">
             <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
             <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl font-bold bg-brand-500 text-white flex items-center gap-2 hover:bg-brand-600 shadow-lg hover:-translate-y-0.5 transition-all">Next Step <ArrowRight size={18}/></button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: PREVIEW TABLE */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2rem] p-8 border border-white/40">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold">Student Data Preview</h2>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{parsedStudents.length} Records Found</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] mb-8 border border-slate-200 dark:border-white/10 rounded-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th className="p-4 font-bold text-slate-500">Roll No</th>
                  <th className="p-4 font-bold text-slate-500">Name</th>
                  {questionCols.map(q => <th key={q} className="p-4 font-bold text-brand-600 dark:text-brand-400">{q}</th>)}
                  <th className="p-4 font-bold text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {parsedStudents.slice(0, 10).map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="p-4 font-semibold">{s.rollNo}</td>
                    <td className="p-4 font-medium">{s.name}</td>
                    {questionCols.map(q => <td key={q} className="p-4">{s.marks[q]}</td>)}
                    <td className="p-4 font-bold">{s.totalMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedStudents.length > 10 && <div className="p-4 text-center text-xs font-medium text-slate-400 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#141414]">Showing first 10 records...</div>}
          </div>
          <div className="flex justify-between">
             <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">Back</button>
             <button onClick={() => setStep(4)} className="px-6 py-3 rounded-xl font-bold bg-brand-500 text-white flex items-center gap-2 shadow-lg">Map Course Outcomes <ArrowRight size={18}/></button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: CO MAPPING */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2rem] p-8 border border-white/40">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold mb-2">Course Outcome (CO) Mapping</h2>
            <p className="text-slate-500">Map each question to its corresponding Course Outcome and set the maximum marks.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {questionCols.map(q => (
              <div key={q} className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-lg shrink-0">
                  {q}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 w-16 shrink-0">Maps To</label>
                    <select 
                      value={coMappings[q].co} 
                      onChange={(e) => setCoMappings({...coMappings, [q]: {...coMappings[q], co: e.target.value}})}
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-brand-500 font-bold"
                    >
                      {['CO1','CO2','CO3','CO4','CO5'].map(co => <option key={co} value={co}>{co}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 w-16 shrink-0">Max Marks</label>
                    <input 
                      type="number" 
                      min="1"
                      value={coMappings[q].maxMarks} 
                      onChange={(e) => setCoMappings({...coMappings, [q]: {...coMappings[q], maxMarks: Number(e.target.value)}})}
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-brand-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
             <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">Back</button>
             <button onClick={() => setStep(5)} className="px-6 py-3 rounded-xl font-bold bg-indigo-500 text-white flex items-center gap-2 shadow-lg hover:bg-indigo-600 hover:-translate-y-0.5 transition-all">Review & Save <Save size={18}/></button>
          </div>
        </motion.div>
      )}

      {/* STEP 5: SAVE */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-[2rem] p-12 text-center border border-white/40">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-emerald-500/30">
            <Save size={40} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Ready to Analyze</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            You are about to save {parsedStudents.length} student records with full CO Mapping logic. The system will automatically compute attainments.
          </p>

          <div className="bg-brand-50/50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-2xl p-4 mb-8 max-w-lg mx-auto flex items-center justify-center gap-2">
             <ShieldAlert size={18} className="text-brand-600 dark:text-brand-400" />
             <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
               Uploading for: <span className="text-brand-600 dark:text-brand-400 ml-1">{JSON.parse(localStorage.getItem('activeClassSession') || '{}').branch} | Sem {JSON.parse(localStorage.getItem('activeClassSession') || '{}').semester?.replace('Sem ', '')} | Sec {JSON.parse(localStorage.getItem('activeClassSession') || '{}').section} | {JSON.parse(localStorage.getItem('activeClassSession') || '{}').subject}</span>
             </p>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-0.5 text-lg flex items-center justify-center gap-3 mx-auto min-w-[200px]"
          >
            {saving ? <div className="w-6 h-6 border-2 border-slate-400 border-t-white rounded-full animate-spin" /> : 'Confirm & Save'}
          </button>
        </motion.div>
      )}

    </div>
  );
};
