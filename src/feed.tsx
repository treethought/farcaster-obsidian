import { StrictMode } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import Feed from "./components/feed";
import Farcaster from "./plugin";
import { AppContext } from "./context";

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
    this.root.render(
      <StrictMode>
        <AppContext.Provider value={{ app: this.app, plugin: this.plugin }}>
          <Feed
            client={this.plugin.client}
            showComposer={this.plugin.showComposer}
          />
        </AppContext.Provider>
      </StrictMode>,
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
