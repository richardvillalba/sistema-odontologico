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
                // ── Ocean Blue Professional ──
                primary: {
                    DEFAULT: '#1565C0',
                    dark: '#0A1628',      // sidebar muy oscuro
                    light: '#BBDEFB',
                    50:  '#E3F2FD',
                    100: '#BBDEFB',
                    200: '#90CAF9',
                    300: '#64B5F6',
                    400: '#42A5F5',
                    500: '#2196F3',
                    600: '#1E88E5',
                    700: '#1565C0',
                    800: '#1565C0',
                    900: '#0D47A1',
                },
                secondary: {
                    DEFAULT: '#00897B',
                    dark: '#00695C',
                    light: '#E0F2F1',
                },
                accent: {
                    DEFAULT: '#7C3AED',
                    light: '#EDE9FE',
                },
                surface: {
                    DEFAULT: '#C2D6EA',   // azul medio – fondo principal (NO blanco)
                    card: '#E8F2FA',      // azul muy claro – tarjetas
                    raised: '#D5E6F4',    // un tono intermedio
                },
                danger: {
                    DEFAULT: '#D32F2F',
                    light: '#FFEBEE',
                },
                warning: {
                    DEFAULT: '#F57C00',
                    light: '#FFF3E0',
                },
                border: '#94BAD8',
                'text-primary': '#0A1F35',    // azul-negro, máximo contraste
                'text-secondary': '#2C4E6C',  // azul medio oscuro
            },
        },
    },
    plugins: [],
}
