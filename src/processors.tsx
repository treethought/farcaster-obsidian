import { StrictMode } from "react";
import { MarkdownRenderChild } from "obsidian";
import { Cast } from "./client/types";
import { createRoot, Root } from "react-dom/client";
import { CastCard } from "./components/castCard";

export class CardMakdownRender extends MarkdownRenderChild {
  el: HTMLElement;
  root: Root | null = null;
  cast: Cast;

  constructor(containerEl: HTMLElement, cast: Cast) {
    super(containerEl);
    this.cast = cast;
  }

  async onload() {
    this.el = this.containerEl.createDiv();
    this.root = createRoot(this.el);
    this.root.render(
      <StrictMode>
        <CastCard cast={this.cast} />
      </StrictMode>,
    );

    this.containerEl.replaceWith(this.el);
  }
  async onClose() {
    this.root?.unmount();
  }
}
