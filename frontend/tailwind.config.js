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
                // ── Clinical Dental Palette ──
                primary: {
                    DEFAULT: '#0B6BCB',
                    dark: '#0A4A8F',
                    light: '#E3EFFB',
                    50: '#E3EFFB',
                    100: '#C7DFFA',
                    200: '#97C3F5',
                    300: '#5BA1E8',
                    400: '#2B82D6',
                    500: '#0B6BCB',
                    600: '#0959A5',
                    700: '#0A4A8F',
                    800: '#073363',
                    900: '#051E3B',
                },
                secondary: {
                    DEFAULT: '#1AA37A',
                    dark: '#15805F',
                    light: '#E6F7F1',
                },
                accent: {
                    DEFAULT: '#6E56CF',
                    light: '#F0EDFC',
                },
                surface: {
                    DEFAULT: '#F1F5F9',
                    card: '#FFFFFF',
                    raised: '#F8FAFC',
                },
                danger: {
                    DEFAULT: '#DC3545',
                    light: '#FEF2F2',
                },
                warning: {
                    DEFAULT: '#ED8936',
                    light: '#FFFBEB',
                },
                border: '#E2E8F0',
                'text-primary': '#0F172A',
                'text-secondary': '#64748B',
            },
        },
    },
    plugins: [],
}
