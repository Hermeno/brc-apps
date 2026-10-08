import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        /* ── Brand blue, sampled from the logo artwork ──
           500 is rgb(24,95,198), the dominant solid pixel in
           public/images/brand/verliks-logo-1200.png. 50-400 are tints of that
           same hue: the ramp used to run through teal, which clashed against a
           blue 500 wherever both steps appeared in one component. */
        brand: {
          50:  { value: "#EEF4FD" },
          100: { value: "#DCE8FA" },
          200: { value: "#B9D1F4" },
          300: { value: "#8CB2EB" },
          400: { value: "#4B84DB" },
          500: { value: "#185FC6" },
          600: { value: "#134A9A" },
          700: { value: "#0E3468" },
          800: { value: "#0C1929" },
          900: { value: "#060D14" },
        },

        /* ── Emerald — confirmation / success only ── */
        green: {
          50:  { value: "#ECFDF5" },
          100: { value: "#D1FAE5" },
          200: { value: "#A7F3D0" },
          400: { value: "#34D399" },
          500: { value: "#10B981" },
          600: { value: "#059669" },
          700: { value: "#047857" },
        },

        /* ── Gold — primary conversion CTAs (matches the landing page accent) ── */
        gold: {
          50:  { value: "#FBF6E3" },
          100: { value: "#F6ECC3" },
          200: { value: "#EDD98A" },
          300: { value: "#E3C868" },
          400: { value: "#DDBE52" },
          500: { value: "#D4AF37" },
          600: { value: "#C4A030" },
          700: { value: "#A5851F" },
        },

        /* ── Amber — warm warning ── */
        yellow: {
          50:  { value: "#FFFBEB" },
          100: { value: "#FEF3C7" },
          200: { value: "#FDE68A" },
          400: { value: "#FBBF24" },
          500: { value: "#F59E0B" },
          600: { value: "#D97706" },
          700: { value: "#B45309" },
        },

        /* ── Rose — refined error ── */
        red: {
          50:  { value: "#FFF1F2" },
          100: { value: "#FFE4E6" },
          200: { value: "#FECDD3" },
          500: { value: "#F43F5E" },
          600: { value: "#E11D48" },
          700: { value: "#BE123C" },
        },

        /* ── Blue-Gray — sophisticated neutral ── */
        slate: {
          50:  { value: "#F8FAFC" },
          100: { value: "#F1F5F9" },
          200: { value: "#E2E8F0" },
          300: { value: "#CBD5E1" },
          400: { value: "#94A3B8" },
          500: { value: "#64748B" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1E293B" },
          900: { value: "#0F172A" },
        },
      },

      fonts: {
        heading: { value: "var(--font-display, 'Google Sans Flex', system-ui, sans-serif)" },
        body:    { value: "var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)" },
      },

      fontSizes: {
        "2xs": { value: "0.65rem" },
        xs:    { value: "0.75rem" },
        sm:    { value: "0.875rem" },
        md:    { value: "1rem" },
        lg:    { value: "1.125rem" },
        xl:    { value: "1.25rem" },
        "2xl": { value: "1.5rem" },
        "3xl": { value: "1.875rem" },
        "4xl": { value: "2.25rem" },
      },

      radii: {
        sm:  { value: "6px" },
        md:  { value: "8px" },
        lg:  { value: "12px" },
        xl:  { value: "16px" },
        "2xl": { value: "20px" },
        "3xl": { value: "24px" },
        full: { value: "9999px" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
