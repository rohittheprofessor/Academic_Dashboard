import React, { useState } from 'react';
import { ErpUploadFlow } from './upload/ErpUploadFlow';
import { SeeUploadFlow } from './upload/SeeUploadFlow';
import { CesUploadFlow } from './upload/CesUploadFlow';

export const UploadView = () => {
  const [mode, setMode] = useState('cie'); // 'cie' | 'see' | 'ces'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">Assessment Upload</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upload college ERP Excel sheets to generate analytics and CO mappings.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMode('cie')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'cie' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'glass text-slate-500'}`}
          >CIE / Internal (per-question)</button>
          <button
            onClick={() => setMode('see')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'see' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'glass text-slate-500'}`}
          >SEE (single overall score)</button>
          <button
            onClick={() => setMode('ces')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === 'ces' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'glass text-slate-500'}`}
          >CES (course exit survey)</button>
        </div>
      </div>

      {mode === 'cie' && <ErpUploadFlow />}
      {mode === 'see' && <SeeUploadFlow />}
      {mode === 'ces' && <CesUploadFlow />}
    </div>
  );
};
