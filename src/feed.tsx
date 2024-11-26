import { StrictMode, useEffect, useRef } from "react";
import { ItemView, SuggestModal, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { Feed } from "./components/feed";
import Farcaster from "./plugin";
import { AppContext } from "./context";
import { Channel, ChannelsResponse } from "./client/types";

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
        <AppContext.Provider
          value={{ app: this.app, plugin: this.plugin }}
        >
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

export class ChannelSelect extends SuggestModal<Channel> {
  plugin: Farcaster;
  channels: Channel[] = [];
  onChannelSelect: (channel: Channel) => void;

  constructor(plugin: Farcaster, onChannelSelect: (channel: Channel) => void) {
    super(plugin.app);
    this.plugin = plugin;
    this.setPlaceholder("Search for a channel");
    this.shouldRestoreSelection = true;
    this.onChannelSelect = onChannelSelect;
  }
  // Returns all available suggestions.
  getSuggestions(query: string): Channel[] {
    return this.channels.filter((channel) =>
      channel.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Renders each suggestion item.
  renderSuggestion(channel: Channel, el: HTMLElement) {
    el.createEl("div", { text: channel.name });
    el.createEl("small", { text: channel.description });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(channel: Channel, evt: MouseEvent | KeyboardEvent) {
    this.inputEl.value = channel.id;
    this.onChannelSelect(channel);
    console.log("selected channel", channel);
  }

  onOpen(): void {
    this.plugin.client.getUserChannels().then((resp: ChannelsResponse) => {
      this.channels = resp.channels;
    });

    this.inputEl.focus();
  }
}

type wrapperProps = {
  el: HTMLElement;
};

export const ElementWrapper = (props: wrapperProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear the container first to avoid duplicates
      containerRef.current.innerHTML = "";
      // Append the Obsidian HTMLElement
      containerRef.current.appendChild(props.el);
    }
  }, [props.el]);

  return <div ref={containerRef}></div>;
};
