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
                // ── Indigo/Violet Modern Palette ──
                primary: {
                    DEFAULT: '#6366F1',
                    dark: '#0F0E1A',      // para referencia, el sidebar usará gradiente
                    light: '#EEF2FF',
                    50:  '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                secondary: {
                    DEFAULT: '#10B981',
                    dark: '#059669',
                    light: '#D1FAE5',
                },
                accent: {
                    DEFAULT: '#EC4899',
                    light: '#FCE7F3',
                },
                surface: {
                    DEFAULT: '#EEF2F7',   // gris-azulado suave — NO blanco
                    card: '#FFFFFF',      // tarjetas blancas que resaltan sobre el fondo
                    raised: '#F5F7FA',    // levemente elevado
                },
                danger: {
                    DEFAULT: '#EF4444',
                    light: '#FEF2F2',
                },
                warning: {
                    DEFAULT: '#F59E0B',
                    light: '#FFFBEB',
                },
                border: '#E2E8F0',
                'text-primary': '#1E293B',   // slate-800
                'text-secondary': '#64748B', // slate-500
            },
        },
    },
    plugins: [],
}
