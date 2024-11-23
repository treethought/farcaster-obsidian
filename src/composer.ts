import { App, Modal, Notice, Setting } from "obsidian";
import Farcaster from "./plugin";

export class ComposerModal extends Modal {
  plugin: Farcaster;
  constructor(app: App, plugin: Farcaster) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    if (!this.plugin.settings.signerUUID) {
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
            try {
              const resp = await this.plugin.client.publishCast(content);
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