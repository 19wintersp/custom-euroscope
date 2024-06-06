import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import rust from "@wasm-tool/rollup-plugin-rust";

export default defineConfig({
  plugins: [
    solid(),
    rust(),
  ],
  publicDir: "pub/",
});
