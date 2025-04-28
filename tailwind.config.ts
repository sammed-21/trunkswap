import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "#0ea7bf",
        textpriamry: "#6A717F",
        lightgray: "#202C2A",
        border: "var(--secondary)",
        headingbackground: "var(--headingBackground)",
      },
      backgroundImage: {
        gradient: "linear-gradient(90deg, #0bd790, #0ea7bf)",
      },
    },
  },
  plugins: [],
};
export default config;
