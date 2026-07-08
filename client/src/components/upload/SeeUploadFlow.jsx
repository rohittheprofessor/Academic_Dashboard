import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, ArrowRight, Save, FileSpreadsheet } from 'lucide-react';
import { parseSeeExcel } from '../../utils/erpParser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// SEE is a single overall score per student, applied uniformly to every CO
// (matching the source spreadsheet — no per-question CO breakdown for SEE).
export const SeeUploadFlow = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [parsedMetadata, setParsedMetadata] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [maxMarks, setMaxMarks] = useState(100);

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
      const data = await parseSeeExcel(file);
      setParsedMetadata(data.metadata);
      setParsedStudents(data.studentRecords);
      setMaxMarks(data.maxMarks);
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
        testName: parsedMetadata.testName || 'External Exam',
        testType: 'External',
        examSequence: 1
      };

      // A single synthetic mapping is required by the schema/analytics pipeline,
      // but the CO -> PO/PSO service reads student.percentage directly for SEE
      // and ignores this mapping's CO — so the CO chosen here is arbitrary and
      // does not affect PO/PSO Attainment results.
      const payload = {
        metadata: finalMetadata,
        coMappings: [{ questionNo: 'Q1', co: 'CO1', maxMarks }],
        studentRecords: parsedStudents
      };

      await axios.post('/api/assessments', payload);
      toast.success('SEE data saved successfully!');
      navigate('/dashboard/po');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save SEE data.');
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
            <p className="font-bold text-slate-700 dark:text-white">Drop your SEE marks sheet here, or click to browse</p>
            <p className="text-xs text-slate-400">Just needs Roll No, Name, and one marks column — no per-question breakdown required.</p>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileDrop} />
          </label>
          {error && <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2rem] p-8 border border-white/40">
          <h2 className="text-2xl font-extrabold mb-2">Confirm SEE Details</h2>
          <p className="text-slate-500 text-sm mb-6">Detected max marks: <strong>{maxMarks}</strong>. Adjust the test name if needed — it must stay recognizable as an external exam.</p>

          <label className="block mb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Test Name</span>
            <input
              type="text"
              value={parsedMetadata.testName}
              onChange={(e) => setParsedMetadata({ ...parsedMetadata, testName: e.target.value })}
              className="w-full bg-transparent font-semibold text-lg text-slate-800 dark:text-white border-b border-slate-200 dark:border-white/10 focus:outline-none focus:border-brand-500 py-1"
            />
          </label>

          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet size={18} className="text-brand-500" />
            <span className="font-bold">{parsedStudents.length} student records found</span>
          </div>

          <div className="overflow-x-auto max-h-[320px] mb-8 border border-slate-200 dark:border-white/10 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th className="p-3 font-bold text-slate-500">Roll No</th>
                  <th className="p-3 font-bold text-slate-500">Name</th>
                  <th className="p-3 font-bold text-slate-500">Marks</th>
                  <th className="p-3 font-bold text-slate-500">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {parsedStudents.slice(0, 10).map((s, i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold">{s.rollNo}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.totalMarks}</td>
                    <td className="p-3">{s.percentage}%</td>
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
              <Save size={18} /> {saving ? 'Saving…' : 'Save SEE data'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
