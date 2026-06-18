export const getToggleCenter = () => {
    const btn = document.querySelector('.theme-toggle-btn');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }
    return {
        x: window.innerWidth * 0.85,
        y: window.innerHeight * 0.05,
    };
};

export const applyTheme = (isDark: boolean, animate = true) => {
    const isCurrentlyDark = document.body.classList.contains('dark');
    if (isCurrentlyDark === isDark) return;

    const performToggle = () => {
        if (isDark) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    };

    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // @ts-ignore
    if (!animate || !document.startViewTransition || isReducedMotion) {
        performToggle();
        return;
    }

    const center = getToggleCenter();
    const maxRadius = Math.hypot(
        Math.max(center.x, window.innerWidth - center.x),
        Math.max(center.y, window.innerHeight - center.y)
    );

    const root = document.documentElement;
    root.style.setProperty('--theme-toggle-x', `${center.x}px`);
    root.style.setProperty('--theme-toggle-y', `${center.y}px`);
    root.style.setProperty('--theme-toggle-r', `${maxRadius}px`);

    // @ts-ignore
    document.startViewTransition(() => {
        performToggle();
    });
};
