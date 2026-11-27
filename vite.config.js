import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// VITE_BASE is set by the GitHub Pages workflow (e.g. "/compliance-transparency-index/").
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
});
