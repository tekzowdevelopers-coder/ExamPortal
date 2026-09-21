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
        tekzow: {
          dark: "#0B192C",
          navy: "#1E3E62",
          blue: "#007BFF",
          cyan: "#00A3FF",
          sky: "#38BDF8",
          light: "#F0F7FF",
        },
      },
      backgroundImage: {
        "tekzow-gradient": "linear-gradient(135deg, #0B192C 0%, #1E3E62 50%, #007BFF 100%)",
        "tekzow-blue-gradient": "linear-gradient(135deg, #007BFF 0%, #00A3FF 60%, #38BDF8 100%)",
        "tekzow-light-gradient": "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
