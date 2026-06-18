import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/components/App';
import { setConfig } from 'react-hot-loader';

// Enable language support.
import './i18n';

// Prevents page reloads while making component changes which
// also avoids triggering constant loading indicators all over
// the place in development.
//
// @see https://github.com/gaearon/react-hot-loader#hook-support
setConfig({ reloadHooks: false });

import { applyTheme } from '@/lib/theme';

const initTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    const isOsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = storedTheme === 'dark' || (!storedTheme && isOsDark);
    applyTheme(shouldBeDark, false);
};

initTheme();

window.addEventListener('storage', () => {
    const storedTheme = localStorage.getItem('theme');
    const isOsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = storedTheme === 'dark' || (!storedTheme && isOsDark);
    applyTheme(shouldBeDark, true);
});

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        localStorage.setItem('theme', e.matches ? 'dark' : 'light');
        applyTheme(e.matches, true);
    });
}

ReactDOM.render(<App />, document.getElementById('app'));
