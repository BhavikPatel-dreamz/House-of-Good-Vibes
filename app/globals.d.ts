declare module "*.css";
declare module "*.css?url" {
  const href: string;
  export default href;
}

declare module "gutenberg-block-kit/editor" {
  import type { ComponentType } from "react";

  export const BlockEditor: ComponentType<Record<string, unknown>>;
}

declare module "gutenberg-block-kit/editor-client" {
  import type { ComponentType, ReactNode } from "react";

  export const ClientBlockEditor: ComponentType<
    Record<string, unknown> & { fallback?: ReactNode }
  >;
  export default ClientBlockEditor;
}

declare module "gutenberg-block-kit/renderer" {
  import type { ComponentType } from "react";

  export const BlockRenderer: ComponentType<{
    html?: string;
    className?: string;
    id?: string;
    as?: string;
  }>;
}

declare module "gutenberg-block-kit/styles";

declare module "gutenberg-block-kit/vite" {
  import type { Plugin } from "vite";

  export function gutenbergBlockKitVite(...args: unknown[]): Plugin | Plugin[];
}
