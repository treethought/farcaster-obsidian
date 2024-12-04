import { StrictMode } from "react";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { Feed } from "./components/feed";
import Farcaster from "./plugin";
import { AppContext, AppProvider } from "./context";
import { Channel } from "./client/types";

export const VIEW_TYPE_FEED = "farcaster-feed-view";

export class FeedView extends ItemView {
	root: Root | null = null;
	plugin: Farcaster;
	selectChannel: Channel;

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
				<AppProvider
					app={this.app}
					plugin={this.plugin}
				>
					<Feed
						client={this.plugin.client}
						showComposer={this.plugin.showComposer}
					/>
				</AppProvider>
			</StrictMode>,
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
