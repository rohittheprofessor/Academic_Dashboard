import React from 'react';
import { useData } from '../../context/DataContext';
import { Sun, Moon, Search, Bell, Upload, Command, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Topbar = () => {
  const { theme, toggleTheme, setActiveTab } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionStr = localStorage.getItem('activeClassSession');
  const session = sessionStr ? JSON.parse(sessionStr) : null;

  const handleSwitchClass = () => {
    if (location.pathname.includes('/upload')) {
      if (!window.confirm('Warning: Switching class now will cause any unsaved upload data to be lost. Proceed?')) {
        return;
      }
    }
    navigate('/dashboard/setup');
  };

  return (
    <header className="h-24 w-full flex items-center justify-between px-8 md:pl-10 sticky top-0 z-10 pt-4 bg-transparent backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm hidden lg:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full glass bg-white/50 dark:bg-[#141414]/50 border-white/40 dark:border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:text-slate-200 transition-all shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
            <Command size={12} /> K
          </div>
        </div>
      </div>

      {session && (
        <div className="hidden md:flex flex-col items-center absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="text-brand-500 dark:text-brand-400">{session.branch}</span>
            <span className="opacity-40">•</span>
            <span>{session.semester}</span>
            <span className="opacity-40">•</span>
            <span>Sec {session.section}</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-800 dark:text-white">{session.subject}</span>
          </div>
          {session.timestamp && (
            <span className="text-[10px] font-medium text-slate-400 mt-1 opacity-70">
              Selected: {new Date(session.timestamp).toLocaleString()}
            </span>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {session && (
          <button 
            onClick={handleSwitchClass}
            className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm"
            title="Switch Class Context"
          >
            <RefreshCw size={14} className="text-brand-500" />
            <span className="hidden lg:inline">Switch Class</span>
          </button>
        )}
        <button 
          onClick={() => setActiveTab('upload')}
          className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Upload size={16} />
          Upload Data
        </button>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl glass hover:bg-white/90 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all hover:scale-105 active:scale-95"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className="p-3 rounded-2xl glass hover:bg-white/90 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-all hover:scale-105 active:scale-95 relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-brand-500 rounded-full border-2 border-white dark:border-[#141414]"></span>
        </button>
        
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-400 via-indigo-500 to-purple-500 border border-white/20 dark:border-white/10 ml-2 cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-105"></div>
      </div>
    </header>
  );
};
