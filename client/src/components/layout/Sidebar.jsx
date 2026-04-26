import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, BarChart3, TrendingUp, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, label, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => twMerge(
        clsx(
          "flex items-center w-full gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-medium relative overflow-hidden group",
          isActive 
            ? "text-brand-600 dark:text-brand-400" 
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        )
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div 
              layoutId="sidebar-active" 
              className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 rounded-2xl border border-brand-100 dark:border-brand-500/20 z-0"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3">
            <Icon size={20} className={isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"} />
            {label}
          </div>
        </>
      )}
    </NavLink>
  );
};

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/students', label: 'Student Ranks', icon: Users },
    { to: '/dashboard/subjects', label: 'Question Analytics', icon: BookOpen },
    { to: '/dashboard/co', label: 'CO Attainment', icon: Target },
    { to: '/dashboard/compare', label: 'CT Comparison', icon: TrendingUp },
    { to: '/dashboard/upload', label: 'Upload Data', icon: BarChart3 },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[280px] h-[calc(100vh-32px)] fixed left-4 top-4 glass rounded-[2rem] z-20 flex flex-col hidden md:flex shadow-2xl shadow-brand-500/5">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
          <BarChart3 className="text-white" size={20} />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">SmartEval</h1>
      </div>
      
      <div className="px-4 py-2 flex-1 flex flex-col gap-2">
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-4">Analytics</div>
        {navItems.map((item) => (
          <SidebarItem
            key={item.to}
            {...item}
          />
        ))}
      </div>

      <div className="p-4 mt-auto">
         <div className="mb-4 px-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-bold truncate mb-3">{user?.name}</p>
            <button onClick={() => navigate('/dashboard/setup')} className="w-full text-left text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:underline">
              Change Class Context
            </button>
         </div>
        <button onClick={logout} className="flex items-center w-full gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};
