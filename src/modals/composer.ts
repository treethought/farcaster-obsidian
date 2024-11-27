import {
  App,
  ButtonComponent,
  Modal,
  Notice,
  TextAreaComponent,
} from "obsidian";
import Farcaster from "../plugin";

export class ComposerModal extends Modal {
  plugin: Farcaster;
  content: string = "";
  constructor(app: App, plugin: Farcaster, content: string) {
    super(app);
    this.plugin = plugin;
    this.content = content;
  }

  onOpen() {
    const { contentEl } = this;
    if (!this.plugin.settings.signerUUID) {
      new Notice("Please sign in with Neynar first in the settings");
      this.setTitle("Not signed in");
      return;
    }

    this.setTitle("Publish Cast");

    const wrapper = contentEl.createEl("div", {
      cls: "modal-content-wrapper",
    });

    let input = new TextAreaComponent(wrapper);
    input.inputEl.rows = 10;
    input.inputEl.style.width = "90%";

    input.setValue(this.content);
    input.setPlaceholder("What's on your mind?");
    input.onChange((value) => {
      this.content = value;
    });

    let footer = contentEl.createDiv({ cls: "compose-modal-footer" });
    let button = new ButtonComponent(footer);
    footer.appendChild(button.buttonEl);
    button.setButtonText("Publish");
    button.setCta();
    button.onClick(async () => {
      try {
        const resp = await this.plugin.client.publishCast(this.content);
        const res = await resp.json();
        console.log("Cast published", res);
        if (!res.success) {
          new Notice("Error publishing cast: " + res.error, 0);
          return;
        }

        new Notice(`Cast published with hash: ${res.cast.hash} `);
        this.close();
        this.content = "";
      } catch (e) {
        console.error(e);
        new Notice("Error publishing cast: " + e, 0);
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
