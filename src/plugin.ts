import * as http from "http";
import { Editor, MarkdownView, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { ComposerModal } from "./composer";
import { FeedView, VIEW_TYPE_FEED } from "./feed";
import { Client } from "./neynar";
import {
  DEFAULT_SETTINGS,
  FarcasterSettings,
  FarcasterSettingTab,
} from "./settings";

export default class Farcaster extends Plugin {
  settings: FarcasterSettings;
  client: Client;
  private server: http.Server | null = null;

  async onload() {
    this.registerView(VIEW_TYPE_FEED, (leaf) => new FeedView(leaf));

    await this.loadSettings();

    this.client = new Client(
      this.settings.neynarClientId,
      this.settings.neynarAPIKey,
    );
    this.client.setSignerData(this.settings.signerUUID, this.settings.fid);

    console.log("Farcaster loaded");

    this.addRibbonIcon("dice", "Farcaster", () => {
      this.activateView();
    });

    this.addCommand({
      id: "farcaster-cast",
      name: "Publish a Cast",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.showComposer();
      },
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new FarcasterSettingTab(this.app, this));
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
    leaf = workspace.getRightLeaf(true);
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
    this.client.setSignerData(this.settings.signerUUID, this.settings.fid);
    this.client.setCredentials(
      this.settings.neynarAPIKey,
      this.settings.neynarClientId,
    );
  }

  async handleAuthResult(signerUUID: string | null, fid: string | null) {
    console.log("handleAuthResult", signerUUID, fid);
    this.settings.signerUUID = signerUUID;
    this.settings.fid = fid;
    await this.saveSettings();
    console.log("stopping auth server");
    this.server?.close();
  }

  async startServer() {
    const PORT = 9123;

    new Notice("starting server");
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
      console.log(`Server is running on port ${PORT}`);
    });
  }

  showComposer() {
    new ComposerModal(this.app, this).open();
  }
}
