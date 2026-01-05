import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (section: keyof AppSettings, key: string, value: any) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType>({} as any);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem('webvlc_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const updateSettings = (section: keyof AppSettings, key: string, value: any) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
      localStorage.setItem('webvlc_settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('webvlc_settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};