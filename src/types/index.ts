import type { Component, FC } from "react";
import type { EditorState } from "prosemirror-state";

export enum ToastType {
  Error = "error",
  Info = "info",
}

export type MenuItem = {
  icon?: typeof Component | FC<any>;
  name?: string;
  title?: string;
  shortcut?: string;
  keywords?: string;
  tooltip?: string;
  attrs?: Record<string, any>;
  visible?: boolean;
  active?: (state: EditorState) => boolean;
};

export type EmbedDescriptor = MenuItem & {
  matcher: (url: string) => boolean | [];
  component: typeof Component | FC<any>;
};
