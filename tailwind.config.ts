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
        primary: "#0bd790",
        secondary: "#0dbbac",
        accent: "#0ea7bf",
      },
      backgroundImage: {
        gradient: "linear-gradient(90deg, #0bd790, #0ea7bf)",
      },
    },
  },
  plugins: [],
};
export default config;
