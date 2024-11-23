import * as http from "http";
import { publishCast } from "neynar";
import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";

class ComposerModal extends Modal {
  settings: FarcasterSettings;
  constructor(app: App, settings: FarcasterSettings) {
    super(app);
    this.settings = settings;
  }

  onOpen() {
    const { contentEl } = this;
    if (!this.settings.signerUUID) {
      new Notice("Please sign in with Neynar first in the settings");
      this.setTitle("Not signed in");
      return;
    }

    this.setTitle("Send a Cast");
    let content = "";

    new Setting(contentEl)
      .addText((text) =>
        text.onChange((value) => {
          content = value;
        })
      );

    new Setting(this.contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Cast")
          .setCta()
          .onClick(async () => {
            console.log("publishing cast: ", this.settings.signerUUID, content);
            try {
              const resp = await publishCast(
                this.settings.neynarAPIKey,
                this.settings.signerUUID || "",
                content,
              );
              const res = await resp.json();
              console.log("Cast published", res);
              if (!res.success) {
                new Notice("Error publishing cast: " + res.error, 0);
                return;
              }

              new Notice(`Cast published with hash: ${res.cast.hash} `);
              this.close();
            } catch (e) {
              console.error(e);
              new Notice("Error publishing cast: " + e, 0);
            }
          })
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
