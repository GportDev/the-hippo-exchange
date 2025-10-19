/// <reference types="vite/client" />

// Provide minimal React 19 compatibility overrides without shadowing the original module exports.
import type {
  ReactNode,
  HTMLAttributes as ReactHTMLAttributes,
  SVGAttributes as ReactSVGAttributes,
} from "react";

declare module "react" {
  interface HTMLAttributes<T> extends ReactHTMLAttributes<T> {
    children?: ReactNode;
  }

  interface SVGAttributes<T> extends ReactSVGAttributes<T> {
    children?: ReactNode;
  }
}
