import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, ShieldCheck, Search, Trash2, Power, UserCheck, X, LogOut } from 'lucide-react';

export const AdminDashboard = () => {
  const { token, logout, user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeachers = async () => {
    try {
      const { data } = await axios.get('/api/admin/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/teachers/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const deleteTeacher = async (id) => {
    if(window.confirm('Are you sure you want to delete this user completely?')) {
      try {
        await axios.delete(`/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher', error);
      }
    }
  };

  const pendingTeachers = teachers.filter(t => t.status === 'Pending');
  const approvedTeachers = teachers.filter(t => t.status === 'Approved' && t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-slate-800 dark:text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-slate-200 dark:border-white/5 z-20 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white dark:text-slate-900" size={18} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Super Admin</h1>
        </div>
        
        <div className="p-4 mt-auto">
          <div className="mb-4 px-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-bold truncate">{user?.name}</p>
          </div>
          <button onClick={logout} className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Admin Dashboard</h2>
          <p className="text-slate-500 font-medium">Manage faculty access and system roles.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
             <div><p className="text-sm font-bold text-slate-500">Total Teachers</p><p className="text-2xl font-extrabold">{teachers.length}</p></div>
          </div>
          <div className="glass-card flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle size={24} /></div>
             <div><p className="text-sm font-bold text-slate-500">Approved</p><p className="text-2xl font-extrabold">{teachers.filter(t => t.status === 'Approved').length}</p></div>
          </div>
          <div className="glass-card flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Clock size={24} /></div>
             <div><p className="text-sm font-bold text-slate-500">Pending Requests</p><p className="text-2xl font-extrabold">{pendingTeachers.length}</p></div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            Pending Approvals
            {pendingTeachers.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pendingTeachers.length} New</span>}
          </h3>
          <div className="glass rounded-3xl overflow-hidden border border-white/40">
            {pendingTeachers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">No pending requests at the moment.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50">
                  <tr><th className="p-4">Name</th><th className="p-4">Department</th><th className="p-4">Email</th><th className="p-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingTeachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold">{teacher.name}</td>
                      <td className="p-4">{teacher.department} ({teacher.designation})</td>
                      <td className="p-4 text-slate-500">{teacher.email}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => updateStatus(teacher._id, 'Approved')} className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 font-semibold shadow-sm"><UserCheck size={16}/> Approve</button>
                        <button onClick={() => updateStatus(teacher._id, 'Rejected')} className="flex items-center gap-1 bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-300 font-semibold shadow-sm"><X size={16}/> Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* All Teachers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Manage Faculty</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search approved teachers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm" />
            </div>
          </div>
          <div className="glass rounded-3xl overflow-hidden border border-white/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr><th className="p-4">Name</th><th className="p-4">Department</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold">{teacher.name}</td>
                    <td className="p-4">{teacher.department}</td>
                    <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold text-xs">Active</span></td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => updateStatus(teacher._id, 'Deactivated')} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"><Power size={16}/></button>
                      <button onClick={() => deleteTeacher(teacher._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {approvedTeachers.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No teachers found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};
