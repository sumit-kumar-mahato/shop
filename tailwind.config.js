/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand accent is driven by the "Primary color" store setting (see app/layout.tsx).
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          fg: "rgb(var(--brand-fg-rgb) / <alpha-value>)",
        },
        luxury: {
          50: "#faf9f6",
          100: "#f5f4ef",
          200: "#e6e3d8",
          300: "#d1cbba",
          400: "#b3aa94",
          500: "#948a73",
          600: "#756d59",
          700: "#575143",
          800: "#3d382e",
          900: "#1f1c17",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.3s ease-out both",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-down": "slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-right": "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-left": "slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        kenburns: "kenburns 30s ease-in-out infinite",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "progress-fill": "progressFill var(--progress-duration, 6.5s) linear forwards",
        rise: "rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scroll-cue": "scrollCue 2s ease-in-out infinite",
        pop: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        // "backwards" (not "both") so the finished animation doesn't leave a stacking context that would
        // trap fixed-position pop-ups (quick view, lightbox, modals) beneath the header.
        "page-in": "fadeIn 0.45s ease-out backwards",
      },
      keyframes: {
        fadeInUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.96)" }, "100%": { opacity: "1", transform: "none" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "none" } },
        slideInRight: { "0%": { transform: "translateX(100%)" }, "100%": { transform: "none" } },
        slideInLeft: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "none" } },
        kenburns: {
          "0%, 100%": { transform: "scale(1.02)" },
          "50%": { transform: "scale(1.08) translate(0.5%, -0.5%)" },
        },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        progressFill: { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
        rise: { "0%": { opacity: "0", transform: "translateY(110%)" }, "100%": { opacity: "1", transform: "none" } },
        scrollCue: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "40%": { opacity: "1" },
          "80%, 100%": { transform: "translateY(14px)", opacity: "0" },
        },
        pop: { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.3)" }, "100%": { transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
