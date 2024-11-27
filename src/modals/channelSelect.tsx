import { SuggestModal } from "obsidian";
import Farcaster from "../plugin";
import { Channel, ChannelsResponse } from "../client/types";

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
  onChooseSuggestion(channel: Channel, _evt: MouseEvent | KeyboardEvent) {
    this.inputEl.value = channel.id;
    this.onChannelSelect(channel);
    console.log("selected channel", channel);
  }

  onOpen(): void {
    this.plugin.client.getUserChannels().then((resp: ChannelsResponse) => {
      this.channels = resp.channels;
    });
  }
}
