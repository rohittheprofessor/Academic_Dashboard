import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [data, setData] = useLocalStorage('academic_dashboard_data', []);
  const [theme, setTheme] = useLocalStorage('academic_dashboard_theme', 'light');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const clearData = () => {
    setData([]);
  };

  const value = {
    data,
    setData,
    clearData,
    theme,
    toggleTheme,
    activeTab,
    setActiveTab
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
