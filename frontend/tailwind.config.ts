import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060913",
          900: "#0a0e1a",
          850: "#0f1629",
          800: "#141c33",
        },
        charcoal: {
          900: "#121724",
          800: "#182033",
          700: "#222c44",
          600: "#2d3a59",
        },
        cyan: {
          400: "#38e1ff",
          500: "#00d2ff",
          600: "#00b2db",
        },
        electric: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};
export default config;
