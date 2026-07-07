import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Target, Save, Settings2, TableProperties } from 'lucide-react';

const CO_IDS = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'];

function getContext() {
  const session = JSON.parse(localStorage.getItem('activeClassSession') || '{}');
  return {
    program: session.branch || '',
    courseId: session.subject || '',
    semester: session.semester || '',
    section: session.section || '',
    sessionYear: session.academicYear || ''
  };
}

function contextIsComplete(ctx) {
  return ctx.courseId && ctx.semester && ctx.section && ctx.sessionYear;
}

export const PoAttainmentView = () => {
  const ctx = getContext();
  const [config, setConfig] = useState(null);
  const [attainment, setAttainment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('attainment');

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: cfg }, { data: att }] = await Promise.all([
        axios.get('/api/course-config', { params: ctx }),
        axios.get('/api/course-config/attainment', { params: ctx })
      ]);
      setConfig(cfg);
      setAttainment(att);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load PO/PSO attainment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contextIsComplete(ctx)) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('/api/course-config', {
        numStudents: config.numStudents,
        coTargets: config.coTargets,
        poList: config.poList,
        poMapping: config.poMapping
      }, { params: ctx });
      setConfig(data);
      toast.success('PO/PSO mapping saved.');
      const { data: att } = await axios.get('/api/course-config/attainment', { params: ctx });
      setAttainment(att);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (!contextIsComplete(ctx)) {
    return <div className="p-8 text-center text-slate-500">Select a class session in Setup first.</div>;
  }
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">PO / PSO Attainment</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Direct (CIE+SEE) and Indirect (CES) attainment combined into CO and Program Outcome scores.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('attainment')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'attainment' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'glass text-slate-500'}`}
          ><Target size={16} /> Attainment</button>
          <button
            onClick={() => setTab('mapping')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'mapping' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'glass text-slate-500'}`}
          ><Settings2 size={16} /> Mapping &amp; Targets</button>
        </div>
      </div>

      {tab === 'mapping' && (
        <MappingEditor config={config} setConfig={setConfig} onSave={saveConfig} saving={saving} />
      )}

      {tab === 'attainment' && attainment && (
        <AttainmentTables attainment={attainment} />
      )}
    </div>
  );
};

function MappingEditor({ config, setConfig, onSave, saving }) {
  function setField(field, value) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }
  function setTarget(i, value) {
    setConfig((prev) => {
      const next = [...prev.coTargets];
      next[i] = Number(value);
      return { ...prev, coTargets: next };
    });
  }
  function setMapping(co, poId, value) {
    setConfig((prev) => ({
      ...prev,
      poMapping: {
        ...prev.poMapping,
        [co]: { ...(prev.poMapping?.[co] || {}), [poId]: value === '' ? '' : Number(value) }
      }
    }));
  }
  function setPoDesc(i, value) {
    setConfig((prev) => {
      const next = [...prev.poList];
      next[i] = { ...next[i], desc: value };
      return { ...prev, poList: next };
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Class Size &amp; CO Targets</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Number of Students</span>
            <input
              type="number"
              className="w-full mt-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-2 text-sm"
              value={config.numStudents}
              onChange={(e) => setField('numStudents', Number(e.target.value))}
            />
          </label>
          {CO_IDS.map((co, i) => (
            <label key={co} className="block">
              <span className="text-xs font-semibold text-slate-500">{co} target %</span>
              <input
                type="number"
                className="w-full mt-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-2 text-sm"
                value={config.coTargets[i]}
                onChange={(e) => setTarget(i, e.target.value)}
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">This is the denominator for every CO/PO percentage — set it to the actual enrolled strength, not just how many records you've uploaded.</p>
      </div>

      <div className="glass-card overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><TableProperties size={20} /> CO → PO/PSO Mapping Strength</h3>
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 text-xs font-bold text-slate-500">CO \ PO</th>
              {config.poList.map((po) => <th key={po.id} className="p-2 text-xs font-bold text-slate-500 text-center">{po.id}</th>)}
            </tr>
          </thead>
          <tbody>
            {CO_IDS.map((co) => (
              <tr key={co} className="border-t border-slate-100 dark:border-white/5">
                <td className="p-2 font-bold">{co}</td>
                {config.poList.map((po) => (
                  <td key={po.id} className="p-2 text-center">
                    <select
                      className="w-14 rounded-lg border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-center py-1"
                      value={config.poMapping?.[co]?.[po.id] ?? ''}
                      onChange={(e) => setMapping(co, po.id, e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">PO / PSO Descriptions</h3>
        <div className="space-y-2">
          {config.poList.map((po, i) => (
            <div key={po.id} className="flex gap-3 items-start">
              <span className="text-xs font-bold text-slate-500 w-14 pt-2">{po.id}</span>
              <textarea
                rows={1}
                className="flex-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 py-2 text-xs"
                value={po.desc}
                onChange={(e) => setPoDesc(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Saving…' : 'Save mapping & targets'}
        </button>
      </div>
    </motion.div>
  );
}

function Num({ v, suffix = '' }) {
  if (v === null || v === undefined) return <span className="text-slate-300">—</span>;
  return <span>{v}{suffix}</span>;
}
function YN({ v }) {
  if (v === null || v === undefined) return <span className="text-slate-300">—</span>;
  return <span className={v ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{v ? 'Y' : 'N'}</span>;
}

function AttainmentTables({ attainment }) {
  const { coRows, poRows, seeAttained, meta } = attainment;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">CO Attainment</h3>
        <p className="text-xs text-slate-400 mb-4">
          Built from {meta.cieAssessmentCount} CIE, {meta.seeAssessmentCount} SEE and {meta.cesAssessmentCount} CES assessment(s) uploaded for this class.
          {seeAttained !== null && <> SEE overall: <strong>{seeAttained}%</strong>.</>}
        </p>
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 font-bold">
              <th className="text-left p-2">CO</th>
              <th className="p-2">CIE %</th><th className="p-2">SEE %</th><th className="p-2">CES %</th>
              <th className="p-2">Direct</th><th className="p-2">Indirect</th><th className="p-2">Overall</th>
              <th className="p-2">On scale of 3</th><th className="p-2">Target</th><th className="p-2">Achieved</th><th className="p-2">Gap</th>
            </tr>
          </thead>
          <tbody>
            {coRows.map((r) => (
              <tr key={r.co} className="border-t border-slate-100 dark:border-white/5 text-center">
                <td className="p-2 text-left font-bold">{r.co}</td>
                <td className="p-2"><Num v={r.cieAttained} suffix="%" /></td>
                <td className="p-2"><Num v={r.seeAttained} suffix="%" /></td>
                <td className="p-2"><Num v={r.cesAttained} suffix="%" /></td>
                <td className="p-2"><Num v={r.direct} suffix="%" /></td>
                <td className="p-2"><Num v={r.indirect} suffix="%" /></td>
                <td className="p-2 font-bold"><Num v={r.overall} suffix="%" /></td>
                <td className="p-2"><Num v={r.onScale3} /></td>
                <td className="p-2">{r.target}%</td>
                <td className="p-2"><YN v={r.achieved} /></td>
                <td className="p-2"><Num v={r.gap} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">PO / PSO Attainment</h3>
        <table className="border-collapse w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 font-bold">
              <th className="text-left p-2">PO/PSO</th>
              <th className="p-2">Max Mapping Strength</th>
              <th className="p-2">Avg. Attainment of Mapped COs</th>
              <th className="p-2">Attainment Index</th>
              <th className="p-2">On scale of 3</th>
            </tr>
          </thead>
          <tbody>
            {poRows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 dark:border-white/5 text-center">
                <td className="p-2 text-left font-bold">{r.id}</td>
                <td className="p-2"><Num v={r.maxStrength} /></td>
                <td className="p-2"><Num v={r.avgAttainment !== null ? Math.round(r.avgAttainment * 100) / 100 : null} suffix="%" /></td>
                <td className="p-2"><Num v={r.index} /></td>
                <td className="p-2"><Num v={r.onScale3} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-400 mt-3">Formula: PO Attainment = (Max Mapping Strength / 3) × Average attainment (%) of COs mapped to that PO.</p>
      </div>
    </motion.div>
  );
}
