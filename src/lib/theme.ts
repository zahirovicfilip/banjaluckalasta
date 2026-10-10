/** Where the visitor's theme choice is kept, in this browser only (ThemeSwitch.tsx). */
export const THEME_KEY = 'banjalucka-lasta-tema';

/** Page colours of each theme, for the browser bar (<meta name="theme-color">). */
export const THEME_BAR = { light: '#f4f7fa', dark: '#03162b' };

/**
 * Runs in <head> before the page paints: a saved choice is applied straight away, so a visitor
 * who picked dark on a light phone never sees a flash of light. Without a choice it does nothing
 * and the page follows the device.
 */
export const themeScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}`;
