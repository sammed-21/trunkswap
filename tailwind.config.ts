import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        spin: "spin 0.5s linear infinite",
      },
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        title: "var(--title)",
        subtitle: "var(--subtitle)",
        textpriamry: "var(--textprimary)",
        background: "var(--background)",
        forground: "var(--foreground)",
        lightgray: "#202C2A",
        border: "var(--border)",
        headingbackground: "var(--headingBackground)",
      },
      backgroundImage: {
        gradient: "linear-gradient(90deg, #0bd790, #0ea7bf)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
