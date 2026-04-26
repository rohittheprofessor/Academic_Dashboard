import React from 'react';
import { ErpUploadFlow } from './upload/ErpUploadFlow';

export const UploadView = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white">Assessment Upload</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Upload college ERP Excel sheets to generate analytics and CO mappings.</p>
      </div>

      <ErpUploadFlow />
    </div>
  );
};
