import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    :root {
        --bg-gradient: radial-gradient(circle at 50% -20%, #ffffff 0%, #e5e3e3 100%);
        --color-neutral-50: #201d1d;
        --color-neutral-100: #201d1d;
        --color-neutral-200: #201d1d;
        --color-neutral-300: #424245;
        --color-neutral-400: #9a9898;
        --color-neutral-500: #646262;
        --color-neutral-600: #f1eeee;
        --color-neutral-700: #f8f7f7;
        --color-neutral-800: #fdfcfc;
        --color-neutral-900: #fdfcfc;
    }

    body.dark {
        --bg-gradient: radial-gradient(circle at 50% -20%, #222225 0%, #050505 100%);
        --color-neutral-50: #fdfcfc;
        --color-neutral-100: #fdfcfc;
        --color-neutral-200: #fdfcfc;
        --color-neutral-300: #d4d4d8;
        --color-neutral-400: #a1a1aa;
        --color-neutral-500: #71717a;
        --color-neutral-600: #3f3f46;
        --color-neutral-700: #27272a;
        --color-neutral-800: #18181b;
        --color-neutral-900: #0f0000;
    }

    body {
        ${tw`font-sans text-neutral-200`};
        background: var(--bg-gradient);
        background-attachment: fixed;
        letter-spacing: 0;
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-medium tracking-normal font-header`};
    }

    p {
        ${tw`text-neutral-200 leading-snug font-sans`};
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    /* Scroll Bar Style */
    ::-webkit-scrollbar {
        background: none;
        width: 16px;
        height: 16px;
    }

    ::-webkit-scrollbar-thumb {
        border: solid 0 rgb(0 0 0 / 0%);
        border-right-width: 4px;
        border-left-width: 4px;
        -webkit-border-radius: 4px 4px;
        -webkit-box-shadow: inset 0 0 0 1px rgba(15,0,0,0.12), inset 0 0 0 4px #646262;
    }

    ::-webkit-scrollbar-track-piece {
        margin: 4px 0;
    }

    ::-webkit-scrollbar-thumb:horizontal {
        border-right-width: 0;
        border-left-width: 0;
        border-top-width: 4px;
        border-bottom-width: 4px;
        -webkit-border-radius: 4px 4px;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }
`;
