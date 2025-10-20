declare module '@tailwindcss/vite' {
  import type { PluginOption } from 'vite';

  // Tailwind's Vite plugin currently exports a factory without published types.
  const tailwindPlugin: (config?: unknown) => PluginOption;
  export default tailwindPlugin;
}
