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
                // ── Dark Navy Medical Palette ──
                primary: {
                    DEFAULT: '#4D9EE8',
                    dark: '#0B1E30',      // Very dark navy for sidebar
                    light: '#1A3D5C',
                    50:  '#E8F2FB',
                    100: '#C5DEFF',
                    200: '#93C2F5',
                    300: '#5DA3E8',
                    400: '#4D9EE8',
                    500: '#2B7CD6',
                    600: '#1A5EBB',
                    700: '#0E4490',
                    800: '#0A2E66',
                    900: '#061B3D',
                },
                secondary: {
                    DEFAULT: '#10D9A0',
                    dark: '#0BAF7F',
                    light: '#0D3A2A',
                },
                accent: {
                    DEFAULT: '#A78BFA',
                    light: '#2D1B5E',
                },
                surface: {
                    DEFAULT: '#0F1E2E',   // Deep navy – main background
                    card: '#172535',      // Slightly lighter navy for cards
                    raised: '#1E3247',    // Raised elements
                },
                danger: {
                    DEFAULT: '#F05252',
                    light: '#3B1010',
                },
                warning: {
                    DEFAULT: '#FBBF24',
                    light: '#3B2800',
                },
                border: '#2A3F56',
                'text-primary': '#DDE9F7',
                'text-secondary': '#7A9BB8',
            },
        },
    },
    plugins: [],
}
