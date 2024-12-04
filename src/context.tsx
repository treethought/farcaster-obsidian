import { createContext, useContext, useState } from "react";
import { App } from "obsidian";
import Farcaster from "./plugin";
import { Channel } from "../client/types";

export interface Context {
	app: App;
	plugin: Farcaster;
	channel: Channel | null;
	setChannel: (channel: Channel | null) => void;
}

export const AppContext = createContext<Context | null>(null);

export const useAppCtx = (): Context => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppCtx must be used within an AppContext.Provider");
	}
	return context;
};

export const AppProvider = (
	props: { app: App; plugin: Farcaster; children: React.ReactNode },
) => {
	const [channel, setChannel] = useState<Channel | null>(null);

	return (
		<AppContext.Provider
			value={{ app: props.app, plugin: props.plugin, channel, setChannel }}
		>
			{props.children}
		</AppContext.Provider>
	);
};
