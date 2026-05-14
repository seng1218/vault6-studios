"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSettings } from "@/app/actions/settings-actions";

const SettingsContext = createContext<any>(null);

export function SettingsProvider({ children, initialSettings }: { children: React.ReactNode, initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings);

  // Function to refresh settings from the database
  const refreshSettings = async () => {
    const res = await getSettings();
    if (res.success) {
      setSettings(res.data);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
