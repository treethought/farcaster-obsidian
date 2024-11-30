import * as http from "http";
import { addIcon, Editor, MarkdownView, Plugin, WorkspaceLeaf } from "obsidian";
import { ComposerModal } from "./modals/composer";
import { FeedView, VIEW_TYPE_FEED } from "./feed";
import { Client } from "./client/neynar";
import { CardMakdownRender } from "./processors";
import {
  DEFAULT_SETTINGS,
  FarcasterSettings,
  FarcasterSettingTab,
} from "./settings";
import { farcasterIcon } from "./icons";

const USE_CALLBACK_SERVER = false;

export default class Farcaster extends Plugin {
  settings: FarcasterSettings;
  client: Client;
  private server: http.Server | null = null;

  async onload() {
    addIcon("farcaster", farcasterIcon);
    await this.loadSettings();

    this.registerView(VIEW_TYPE_FEED, (leaf) => new FeedView(leaf, this));
    this.addProcessor();

    this.client = new Client(this.settings);

    console.log("Farcaster loaded");

    this.addRibbonIcon("farcaster", "Farcaster", () => {
      this.activateView();
    });

    this.addCommand({
      id: "farcaster-feed",
      name: "Open Farcaster Feed",
      callback: () => {
        this.activateView();
      },
    });

    this.addCommand({
      id: "farcaster-cast",
      name: "Publish a Cast",
      callback: () => {
        this.showComposer();
      },
    });

    this.addCommand({
      id: "farcaster-cast-current-note",
      name: "Publish note as Cast",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        let text = editor.getSelection();
        if (!text) {
          text = view.getViewData();
        }
        this.showComposer(text);
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new FarcasterSettingTab(this.app, this));
  }

  addProcessor() {
    console.log("adding processor");
    this.registerMarkdownPostProcessor((element, context) => {
      const links = element.findAll("a");
      for (let link of links) {
        const href = link.getAttribute("href");
        if (href && href.startsWith("https://warpcast")) {
          console.log("processing link", href);
          this.client.getCastByUrl(href).then((cast) => {
            if (cast) {
              context.addChild(new CardMakdownRender(link, cast));
            }
          });
        }
      }
    });
  }

  addChannelSelectCommand(cb: () => void) {
    this.addCommand({
      id: "farcaster-select-channel",
      name: "View Channel",
      callback: () => {
        cb();
      },
    });
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_FEED);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
      workspace.revealLeaf(leaf);
      return;
    }

    // Our view could not be found in the workspace, create a new leaf
    // in the right sidebar for it
    leaf = workspace.getRightLeaf(false);
    await leaf?.setViewState({ type: VIEW_TYPE_FEED, active: true });

    // "Reveal" the leaf in case it is in a collapsed sidebar
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  onunload() {
    console.log("Farcaster unloaded");

    if (this.server) {
      this.server.close(() => {
        console.log("Server closed");
      });
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.client.updateSettings(this.settings);
  }

  async handleAuthResult(signerUUID: string | null, fid: string | null) {
    console.log("sinw signer success");
    this.settings.signerUUID = signerUUID;
    this.settings.fid = fid;
    await this.saveSettings();
    console.log("stopping auth server");
    this.server?.close();
  }

  async startServer() {
    if (!USE_CALLBACK_SERVER) {
      return;
    }
    const PORT = 9123;

    this.server = http.createServer(async (req, res) => {
      console.log(req.method, req.url);
      if (req.method === "GET" && req.url?.startsWith("/signin/success")) {
        const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
        const fid = url.searchParams.get("fid");
        const signer_uuid = url.searchParams.get("signer_uuid");

        if (fid === null || signer_uuid === null) {
          console.log("Invalid request");
          res.writeHead(400, { "Content-Type": "text/plain" });
        }

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Sign in successful!");
        this.handleAuthResult(signer_uuid, fid);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      }
    });

    this.server.listen(PORT, () => {
      console.log(`SINW callback server is running on port ${PORT}`);
    });
  }

  showComposer(content: string = "") {
    new ComposerModal(this.app, this, content).open();
  }
}
