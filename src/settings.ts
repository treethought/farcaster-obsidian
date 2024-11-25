import { App, PluginSettingTab, Setting } from "obsidian";
import Farcaster from "./plugin";

const SIGNIN_URL =
  "https://amnisiac.mypinata.cloud/ipfs/QmSYwh1K4VBB5JywsRAgdype6znRB5Loz9a98oPz7mugFq?pinataGatewayToken=UFeGg0sVn0f2GdYVEUj8bmp4e4eTnqzOm_EMjDsKnVTmz4tpKcG__2X245d1ABuZ";

export interface FarcasterSettings {
  neynarAPIKey: string;
  neynarClientId: string;
  signinUrl: string;
  signerUUID: string | null;
  fid: string | null;
}

export const DEFAULT_SETTINGS: FarcasterSettings = {
  neynarAPIKey: "",
  neynarClientId: "",
  signinUrl: SIGNIN_URL,
  signerUUID: "",
  fid: "",
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
      .setName("Sign in with Neynar")
      .setDesc("Click to sign in or update signer")
      .addButton((btn) => {
        btn.setButtonText("Sign in");
        btn.onClick(async () => {
          this.plugin.startServer();
          console.log(window);
          window.open(SIGNIN_URL, "_blank");
        });
      });

    new Setting(containerEl)
      .setName("Neynar App Client ID")
      .setDesc("Client ID for your own Neynar app")
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
      .setDesc("API Key for your own Neynar app")
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
      .setDesc("Farcaster ID")
      .addText((text) =>
        text
          .setPlaceholder("FID of the signer's account")
          .setValue(this.plugin.settings.fid || "")
          .onChange(async (value) => {
            this.plugin.settings.fid = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
