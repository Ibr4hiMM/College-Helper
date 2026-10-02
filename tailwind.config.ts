import type { Config } from "tailwindcss";

const ink = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: ink("paper"),
        ruling: ink("ruling"),
        print: ink("print"),
        spot: ink("spot"),
        ballpoint: ink("ballpoint"),
        pen: ink("pen"),
        cover: ink("cover"),
        "cover-ink": ink("cover-ink"),
        "cover-soft": ink("cover-soft"),
      },
      fontFamily: {
        print: ["var(--f-readex)", "system-ui", "sans-serif"],
        // ponytail: literal faces, not the next/font vars. Each var carries a Times-based "Fallback" face
        // that has Arabic glyphs and would shadow Naskh. Names are stable under Turbopack (dev + build).
        read: ['"Literata"', '"Noto Naskh Arabic"', "Georgia", "serif"],
        pen: ["var(--f-ruqaa)", "var(--f-readex)", "serif"],
      },
      spacing: {
        rule: "var(--rule)",
        margin: "var(--margin)",
      },
      lineHeight: {
        rule: "var(--rule)",
        "rule-2": "calc(var(--rule) * 2)",
      },
      boxShadow: {
        sheet: "0 1px 2px rgb(0 0 0 / 0.22), 0 28px 56px -28px rgb(0 0 0 / 0.55)",
      },
    },
  },
} satisfies Config;
