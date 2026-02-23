/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                // ── Slate Dark Palette (alta legibilidad) ──
                primary: {
                    DEFAULT: '#3B82F6',
                    dark: '#020617',      // slate-950 para sidebar
                    light: '#1E3A5F',
                    50:  '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                },
                secondary: {
                    DEFAULT: '#10B981',
                    dark: '#059669',
                    light: '#064E3B',
                },
                accent: {
                    DEFAULT: '#8B5CF6',
                    light: '#2E1065',
                },
                surface: {
                    DEFAULT: '#0F172A',   // slate-900 – fondo principal
                    card: '#1E293B',      // slate-800 – tarjetas (contraste claro vs fondo)
                    raised: '#293548',    // un paso más claro para elementos elevados
                },
                danger: {
                    DEFAULT: '#F87171',
                    light: '#450A0A',
                },
                warning: {
                    DEFAULT: '#FBBF24',
                    light: '#451A03',
                },
                border: '#334155',        // slate-700 – borde visible pero sutil
                'text-primary': '#F1F5F9',   // slate-100 – texto principal blanco-azulado
                'text-secondary': '#94A3B8', // slate-400 – texto secundario legible
            },
        },
    },
    plugins: [],
}
