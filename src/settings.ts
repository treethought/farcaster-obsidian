import { App, PluginSettingTab, Setting } from "obsidian";
import Farcaster from "./plugin";

const PROXY_URL = "https://farcaster-obsidian-holy-dream-8544.fly.dev";
const PROXY_SIGNIN_URL = PROXY_URL + "/signin";
const NEYNAR_URL = "https://api.neynar.com/v2/farcaster";

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
  signinUrl: PROXY_URL,
  signerUUID: "",
  fid: "",
  apiBaseUrl: PROXY_URL,
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
            this.plugin.settings.apiBaseUrl = NEYNAR_URL;
          } else {
            console.log("default api");
            this.plugin.settings.customAPI = false;
            this.plugin.settings.apiBaseUrl = PROXY_URL;
            this.plugin.settings.signinUrl = PROXY_SIGNIN_URL;
          }
          await this.plugin.saveSettings();
        });
      })
      .setHeading();

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

    new Setting(containerEl)
      .setName("Signin URL")
      .setDesc(
        "URL to your SINW page. Note that currently you must configure the the success callback to http://127.0.0.1:9123/signin/success",
      )
      .addText((text) =>
        text.setPlaceholder("")
          .setValue(this.plugin.settings.signinUrl)
          .onChange(async (value) => {
            this.plugin.settings.signinUrl = value;
            await this.plugin.saveSettings();
          })
      )
      .addButton((btn) => {
        btn.setButtonText("View Example");
        btn.onClick(() => {
          window.open(
            "https://github.com/treethought/farcaster-obsidian/blob/main/siwn.html.example",
            "_blank",
          );
        });
      });
  }
}
