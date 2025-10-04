"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getApplicationSettings } from "@/actions/ApplicationSettings";
import {ApplicationSettings} from "@igniter/db/middleman/schema";

const ApplicationSettingsContext = createContext<ApplicationSettings | undefined>(undefined);

export const ApplicationSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [applicationSettings, setApplicationSettings] =
    useState<ApplicationSettings | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const settings = await getApplicationSettings();
        setApplicationSettings(settings);
      } catch (error) {
       console.error(error);
      }
    })();
  }, []);

  return (
    <ApplicationSettingsContext.Provider value={applicationSettings}>
      {children}
    </ApplicationSettingsContext.Provider>
  );
};

export const useApplicationSettings = () =>
  useContext(ApplicationSettingsContext);
