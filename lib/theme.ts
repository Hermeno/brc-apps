import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        /* ── Sky Blue — signature brand color ── */
        brand: {
          50:  { value: "#EBF5FE" },
          100: { value: "#D0E9FC" },
          200: { value: "#A2D3F9" },
          300: { value: "#60B5F5" },
          400: { value: "#2D9AEC" },
          500: { value: "#0A80DB" },
          600: { value: "#0870C2" },
          700: { value: "#065594" },
          800: { value: "#043A65" },
          900: { value: "#022039" },
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
        heading: { value: "var(--font-dm-sans, 'DM Sans', sans-serif)" },
        body:    { value: "var(--font-inter, 'Inter', sans-serif)" },
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
