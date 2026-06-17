/**
 * Shared Anime.js v4 animation utilities for the Pterodactyl panel.
 * Design philosophy: mechanical, precise, terminal-native.
 * All motion is intentional — no decorative bounces.
 *
 * Anime.js v4 uses named exports: animate, stagger, createTimeline, cubicBezier
 */
import { animate, stagger, cubicBezier } from 'animejs';

// Shared precision easing: fast start, sharp deceleration — mechanical, not bouncy
const preciseEase = cubicBezier(0.22, 1, 0.36, 1);

/**
 * Staggered entrance for a list of row elements.
 * Each row slides up from a slight offset and fades in.
 */
export const staggerRows = (targets: NodeListOf<Element> | Element[], delay = 0) => {
    return animate(targets, {
        opacity: [0, 1],
        translateY: [8, 0],
        ease: preciseEase,
        duration: 350,
        delay: stagger(40, { start: delay }),
    });
};

/**
 * Staggered entrance for grid/card elements (stat blocks, etc).
 * Slides in from left with fast deceleration.
 */
export const staggerCards = (targets: NodeListOf<Element> | Element[], delay = 0) => {
    return animate(targets, {
        opacity: [0, 1],
        translateX: [-12, 0],
        ease: preciseEase,
        duration: 420,
        delay: stagger(55, { start: delay }),
    });
};

/**
 * Fade-up entrance for a single container element.
 */
export const fadeUp = (targets: Element | HTMLElement, delay = 0) => {
    return animate(targets, {
        opacity: [0, 1],
        translateY: [14, 0],
        ease: preciseEase,
        duration: 400,
        delay,
    });
};

/**
 * Slide-down entrance for dropdown/mobile menu.
 */
export const slideDown = (targets: Element | HTMLElement, delay = 0) => {
    return animate(targets, {
        opacity: [0, 1],
        translateY: [-10, 0],
        ease: preciseEase,
        duration: 220,
        delay,
    });
};

/**
 * Flash animation for a single element — used to signal state change.
 */
export const flash = (targets: Element | HTMLElement) => {
    return animate(targets, {
        opacity: [1, 0.2, 1],
        ease: 'linear',
        duration: 400,
    });
};
