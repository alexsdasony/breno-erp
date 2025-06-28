
import React, { createContext, useState, useEffect, useContext } from 'react';
import { initialData } from '@/config/initialData';
import { useAuth } from '@/hooks/useAuth';
import { useCrud } from '@/hooks/useCrud';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('erpData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        const finalData = { ...initialData };

        Object.keys(initialData).forEach(key => {
            if(parsedData[key]) {
                finalData[key] = parsedData[key];
            }
        });

        if (!finalData.users || !finalData.users.some(u => u.email === 'admin@erppro.com')) {
          finalData.users = [...(finalData.users || []), ...initialData.users.filter(iu => !(finalData.users || []).some(fu => fu.email === iu.email))];
        }
        
        const hasInitialMockData = parsedData.customers && parsedData.customers.length > 10;
        if (!hasInitialMockData) {
           return initialData;
        }

        if (!parsedData.segments) {
          finalData.segments = initialData.segments;
        }

        return finalData;

      } catch (error) {
        console.error("Failed to parse erpData from localStorage", error);
        return initialData;
      }
    }
    return initialData;
  });

  const [activeSegmentId, setActiveSegmentId] = useState(null);

  useEffect(() => {
    localStorage.setItem('erpData', JSON.stringify(data));
  }, [data]);

  const auth = useAuth(data, setData);
  const crud = useCrud(setData);

  const value = {
    data,
    setData,
    activeSegmentId,
    setActiveSegmentId,
    ...auth,
    ...crud,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
