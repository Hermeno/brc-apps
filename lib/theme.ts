import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: "#EFF6FF" },
          100: { value: "#DBEAFE" },
          200: { value: "#BFDBFE" },
          400: { value: "#60A5FA" },
          500: { value: "#2563EB" },
          600: { value: "#1D4ED8" },
          700: { value: "#1E40AF" },
          900: { value: "#1E3A8A" },
        },
        yellow: {
          50:  { value: "#FFFBEB" },
          100: { value: "#FEF3C7" },
          400: { value: "#FBBF24" },
          500: { value: "#F59E0B" },
          600: { value: "#D97706" },
        },
        green: {
          50:  { value: "#F0FDF4" },
          100: { value: "#DCFCE7" },
          200: { value: "#BBF7D0" },
          500: { value: "#22C55E" },
          600: { value: "#16A34A" },
          700: { value: "#15803D" },
        },
        red: {
          50:  { value: "#FEF2F2" },
          100: { value: "#FEE2E2" },
          500: { value: "#EF4444" },
          600: { value: "#DC2626" },
          700: { value: "#B91C1C" },
        },
        slate: {
          50:  { value: "#F9FAFB" },
          100: { value: "#F3F4F6" },
          200: { value: "#E5E7EB" },
          400: { value: "#9CA3AF" },
          500: { value: "#6B7280" },
          600: { value: "#4B5563" },
          700: { value: "#374151" },
          800: { value: "#1F2937" },
          900: { value: "#111827" },
        },
      },
      fonts: {
        heading: { value: "'Inter', sans-serif" },
        body:    { value: "'Inter', sans-serif" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
