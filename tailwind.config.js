const colors = require('tailwindcss/colors');

const gray = {
    50: 'var(--color-neutral-50)',
    100: 'var(--color-neutral-100)',
    200: 'var(--color-neutral-200)',
    300: 'var(--color-neutral-300)',
    400: 'var(--color-neutral-400)',
    500: 'var(--color-neutral-500)',
    600: 'var(--color-neutral-600)',
    700: 'var(--color-neutral-700)',
    800: 'var(--color-neutral-800)',
    900: 'var(--color-neutral-900)',
};

const brand = {
    50: 'var(--color-neutral-900)',
    100: 'var(--color-neutral-800)',
    200: 'var(--color-neutral-700)',
    300: 'var(--color-neutral-600)',
    400: 'var(--color-neutral-500)',
    500: 'var(--color-neutral-50)',
    600: 'var(--color-neutral-50)',
    700: 'var(--color-neutral-50)',
    800: 'var(--color-neutral-50)',
    900: 'var(--color-neutral-50)',
};

const red = {
    50: '#fdfcfc',
    100: '#fdfcfc',
    200: '#fdfcfc',
    300: '#fdfcfc',
    400: '#d70015',
    500: '#ff3b30',
    600: '#ff3b30',
    700: '#a50011',
    800: '#a50011',
    900: '#a50011',
};

module.exports = {
    darkMode: 'class',
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"Berkeley Mono"', '"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
                sans: ['"Berkeley Mono"', '"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
                mono: ['"Berkeley Mono"', '"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
            },
            colors: {
                black: '#201d1d',
                primary: brand,
                blue: brand,
                gray: gray,
                neutral: gray,
                red: red,
                cyan: colors.cyan,
            },
            borderRadius: {
                none: '0px',
                sm: '4px',
                DEFAULT: '4px',
                md: '4px',
                lg: '0px',
                xl: '0px',
                '2xl': '0px',
                '3xl': '0px',
                full: '0px',
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: 'rgba(15,0,0,0.12)',
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
