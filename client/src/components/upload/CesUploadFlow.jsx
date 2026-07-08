import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Save, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { parseCesExcel } from '../../utils/erpParser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// CES: each rating column already tells us its CO from the sheet's own
// header row, so we skip the manual CO-mapping step entirely.
export const CesUploadFlow = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [parsedMetadata, setParsedMetadata] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [questionColumns, setQuestionColumns] = useState([]);
  const [coMap, setCoMap] = useState({});
  const [maxMarksMap, setMaxMarksMap] = useState({});

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Please upload a valid Excel or CSV file.');
      return;
    }

    try {
      const data = await parseCesExcel(file);
      setParsedMetadata(data.metadata);
      setParsedStudents(data.studentRecords);
      setQuestionColumns(data.questionColumns);
      setCoMap(data.coMap);
      setMaxMarksMap(data.maxMarksMap);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const classContext = JSON.parse(localStorage.getItem('activeClassSession') || '{}');

      const finalMetadata = {
        ...parsedMetadata,
        sessionYear: classContext.academicYear || parsedMetadata.session,
        program: classContext.branch || parsedMetadata.program,
        semester: classContext.semester || parsedMetadata.semester,
        section: classContext.section || parsedMetadata.section,
        courseId: classContext.subject || parsedMetadata.course,
        testName: parsedMetadata.testName || 'Course Exit Survey',
        testType: 'CES',
        examSequence: 1
      };

      const payload = {
        metadata: finalMetadata,
        coMappings: questionColumns.map((q) => ({ questionNo: q, co: coMap[q], maxMarks: maxMarksMap[q] })),
        studentRecords: parsedStudents
      };

      await axios.post('/api/assessments', payload);
      toast.success('CES data saved successfully!');
      navigate('/dashboard/po');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save CES data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-[2rem] p-16 cursor-pointer transition-all ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10 glass'}`}
          >
            <UploadCloud size={40} className="text-brand-500" />
            <p className="font-bold text-slate-700 dark:text-white">Drop your Course Exit Survey sheet here, or click to browse</p>
            <p className="text-xs text-slate-400">Needs a row of CO1..CO5 labels above the student table — each rating column's CO is detected automatically.</p>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileDrop} />
          </label>
          {error && <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2rem] p-8 border border-white/40">
          <h2 className="text-2xl font-extrabold mb-2">Confirm Detected CO Mapping</h2>
          <p className="text-slate-500 text-sm mb-6">Detected automatically from your sheet's header row — check this looks right before saving.</p>

          <label className="block mb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Name</span>
            <input
              type="text"
              value={parsedMetadata.testName}
              onChange={(e) => setParsedMetadata({ ...parsedMetadata, testName: e.target.value })}
              className="w-full bg-transparent font-semibold text-lg text-slate-800 dark:text-white border-b border-slate-200 dark:border-white/10 focus:outline-none focus:border-brand-500 py-1"
            />
          </label>

          <div className="flex flex-wrap gap-2 mb-6">
            {questionColumns.map((q) => (
              <span key={q} className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 text-xs font-semibold">
                <CheckCircle2 size={12} className="text-emerald-500" /> {q} → {coMap[q]} <span className="text-slate-400">(max {maxMarksMap[q]})</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet size={18} className="text-brand-500" />
            <span className="font-bold">{parsedStudents.length} student records found</span>
          </div>

          <div className="overflow-x-auto max-h-[320px] mb-8 border border-slate-200 dark:border-white/10 rounded-2xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th className="p-3 font-bold text-slate-500">Roll No</th>
                  <th className="p-3 font-bold text-slate-500">Name</th>
                  {questionColumns.map((q) => <th key={q} className="p-3 font-bold text-brand-600 dark:text-brand-400">{coMap[q]}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {parsedStudents.slice(0, 10).map((s, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold">{s.rollNo}</td>
                    <td className="p-3">{s.name}</td>
                    {questionColumns.map((q) => <td key={q} className="p-3">{s.marks[q]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedStudents.length > 10 && <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-[#141414]">Showing first 10 of {parsedStudents.length}...</div>}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">Back</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold bg-brand-500 text-white flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {saving ? 'Saving…' : 'Save CES data'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
