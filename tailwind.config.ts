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
        aurora: "aurora 60s linear infinite",
      },
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",
        secondary: "var(--secondary)",
        hover: "var(--hover)",
        accent: "var(--accent)",
        "error-primary": "var(--error-primary)",
        "error-secondary": "var(--error-secondary)",
        title: "var(--title)",
        subtitle: "var(--subtitle)",
        textprimary: "var(--textprimary)",
        background: "var(--background)",
        forground: "var(--foreground)",
        lightgray: "#202C2A",
        border: "var(--border)",
        headingbackground: "var(--headingBackground)",
      },
      backgroundImage: {
        gradient: "linear-gradient(90deg, #0bd790, #0ea7bf)",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
