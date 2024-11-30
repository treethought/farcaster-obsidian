import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import Farcaster from "./plugin";

const HOSTED_PROXY_URL = "https://farcaster-obsidian-holy-dream-8544.fly.dev";
// const HOSTED_PROXY_URL = "http://localhost:8080";
const HOSTED_SIGNIN_URL = HOSTED_PROXY_URL + "/signin";
const NEYNAR_URL = "https://api.neynar.com";

export interface FarcasterSettings {
	neynarAPIKey: string;
	neynarClientId: string;
	signinUrl: string;
	signerUUID: string | null;
	fid: string | null;
	apiBaseUrl: string;
	customAPI: boolean;
}

export const DEFAULT_SETTINGS: FarcasterSettings = {
	neynarAPIKey: "",
	neynarClientId: "",
	signinUrl: HOSTED_SIGNIN_URL,
	signerUUID: "",
	fid: "",
	apiBaseUrl: HOSTED_PROXY_URL,
	customAPI: false,
};

export class FarcasterSettingTab extends PluginSettingTab {
	plugin: Farcaster;

	constructor(app: App, plugin: Farcaster) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Signer UUID")
			.setDesc(
				"Neynar managed signer. May only be used with the client ID used to create it",
			)
			.addText((text) =>
				text
					.setPlaceholder("Sign in to create signer")
					.setValue(this.plugin.settings.signerUUID || "")
					.onChange(async (value) => {
						this.plugin.settings.signerUUID = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("FID")
			.setDesc("Optional Farcaster ID to use for viewer context")
			.addText((text) =>
				text
					.setPlaceholder("FID of the signer's account")
					.setValue(this.plugin.settings.fid || "")
					.onChange(async (value) => {
						this.plugin.settings.fid = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Sign in with Neynar")
			.setDesc("Click to sign in or update signer")
			.addButton((btn) => {
				btn.setButtonText("Sign in");
				btn.onClick(async () => {
					if (this.plugin.settings.customAPI) {
						new Notice(
							"Custom Neynar app is enabled. Please use your own app to get a signer.",
						);
						return;
					}

					this.plugin.startServer();
					console.log(window);
					window.open(this.plugin.settings.signinUrl, "_blank");
				});
			});

		new Setting(containerEl).setName("Neynar")
			.setHeading();

		new Setting(containerEl).setName("Use Custom Neynar App")
			.setDesc("Use your own Nenay App and credentials")
			.addToggle(async (toggle) => {
				toggle.onChange(async (value) => {
					if (value) {
						console.log("custom api");
						this.plugin.settings.customAPI = true;
						this.plugin.settings.apiBaseUrl = NEYNAR_URL + "/v2/farcaster";
						this.plugin.settings.signinUrl = "";
					} else {
						console.log("default api");
						this.plugin.settings.customAPI = false;
						this.plugin.settings.apiBaseUrl = HOSTED_PROXY_URL +
							"/v2/farcaster";
						this.plugin.settings.signinUrl = HOSTED_SIGNIN_URL;
					}
					await this.plugin.saveSettings();
				});
			})
			.setHeading();

		new Setting(containerEl)
			.setName("API URL")
			.setDesc("Base URL for Neynar API or API proxy")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.apiBaseUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiBaseUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Neynar App Client ID")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.neynarClientId)
					.onChange(async (value) => {
						this.plugin.settings.neynarClientId = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Neynar App API Key")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.neynarAPIKey)
					.onChange(async (value) => {
						this.plugin.settings.neynarAPIKey = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
