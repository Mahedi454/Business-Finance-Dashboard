import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        border: "#E5E7EB",
        background: "#F6F8FC",
        card: "#FFFFFF",
        primary: "#5B4BFF",
        sidebar: "#061A3A",
        success: "#16A34A",
        danger: "#EF4444",
        warning: "#F59E0B"
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px"
      },
      boxShadow: {
        panel: "0 14px 40px rgba(6, 26, 58, 0.08)"
      }
    }
  },
  plugins: [animate]
};

export default config;
