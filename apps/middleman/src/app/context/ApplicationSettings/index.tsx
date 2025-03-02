"use client";

import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {getApplicationSettings} from "@/actions/ApplicationSettings";

export interface ApplicationSettings {
  configuredChain?: string;
}

const ApplicationSettingsContext = createContext<ApplicationSettings>({});

export const ApplicationSettingsProvider = ({children}: { children: ReactNode }) => {
  const [applicationSettings, setApplicationSettings] = useState<ApplicationSettings>({});

  useEffect(() => {
    (async () => {
      const settings = await getApplicationSettings();
      setApplicationSettings(settings);
    })();
  }, []);

  return (
    <ApplicationSettingsContext.Provider value={applicationSettings}>
      {children}
    </ApplicationSettingsContext.Provider>
  );
};

export const useApplicationSettings = () => useContext(ApplicationSettingsContext);
