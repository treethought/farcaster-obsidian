import { createContext, useContext } from "react";
import { App } from "obsidian";
import Farcaster from "./plugin";

export interface Context {
  app: App;
  plugin: Farcaster;
}

export const AppContext = createContext<Context | null>(null);

export const useAppCtx = (): Context => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppCtx must be used within an AppContext.Provider");
  }
  return context
};
