import { StrictMode } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import Feed from "./components/feed";
import Farcaster from "./plugin";

export const VIEW_TYPE_FEED = "farcaster-feed-view";

export class FeedView extends ItemView {
  root: Root | null = null;
  plugin: Farcaster;

  constructor(leaf: WorkspaceLeaf, plugin: Farcaster) {
    super(leaf);
    this.plugin = plugin;
    this.icon = "farcaster";
  }

  getViewType() {
    return VIEW_TYPE_FEED;
  }

  getDisplayText() {
    return "Farcaster Feed";
  }

  async onOpen() {
    this.root = createRoot(this.containerEl.children[1]);
    console.log("FeedView onOpen");
    console.log(this.plugin.client);
    this.root.render(
      <StrictMode>
        <Feed client={this.plugin.client} />,
      </StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
