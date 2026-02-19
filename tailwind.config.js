/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        neon: {
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,.35), 0 0 40px rgba(56,189,248,.18)",
        glowStrong: "0 0 0 1px rgba(56,189,248,.55), 0 0 70px rgba(56,189,248,.28)"
      }
    }
  },
  plugins: []
};