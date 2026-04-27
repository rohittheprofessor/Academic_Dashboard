import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PendingPage } from './pages/auth/PendingPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { UploadView } from './components/UploadView';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { SubjectsView } from './components/SubjectsView';
import { SettingsView } from './components/SettingsView';
import { ClassSetupPage } from './pages/teacher/ClassSetupPage';
import { ComparisonView } from './components/ComparisonView';
import { CoAnalyticsView } from './components/CoAnalyticsView';
import { HistoryView } from './components/HistoryView';
import { Toaster } from 'react-hot-toast';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'Super Admin') return <Navigate to="/dashboard" replace />;
  
  return children;
};

// Redirect /dashboard based on session
const DashboardIndexRedirect = () => {
  const hasSession = localStorage.getItem('activeClassSession');
  return <Navigate to={hasSession ? "/dashboard/overview" : "/dashboard/setup"} replace />;
};

// Legacy Dashboard Layout Wrapper (until Phase 3 fully replaces it)
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark font-sans text-slate-800 dark:text-slate-100 relative">
      <Sidebar />
      <div className="flex-1 md:ml-[312px] flex flex-col min-w-0 min-h-screen">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'glass dark:bg-[#1a1a1a] dark:text-white border border-white/20' }} />
      <BrowserRouter>
        <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending" element={<PendingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/dashboard" element={<DashboardIndexRedirect />} />
            <Route path="/dashboard/setup" element={
              <ProtectedRoute>
                <ClassSetupPage />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="overview" element={<DashboardView />} />
                    <Route path="students" element={<StudentsView />} />
                    <Route path="subjects" element={<SubjectsView />} />
                    <Route path="co" element={<CoAnalyticsView />} />
                    <Route path="compare" element={<ComparisonView />} />
                    <Route path="history" element={<HistoryView />} />
                    <Route path="upload" element={<UploadView />} />
                    <Route path="settings" element={<SettingsView />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </DataProvider>
      </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
