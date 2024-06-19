'use client'

import { SettingsContext } from "@/lib/SettingsContext";
import useSettings from "@/lib/useSettings";

export default function SettingsProvider({ children }) {
  const settings = useSettings();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}