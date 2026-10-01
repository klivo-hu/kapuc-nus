/**
 * Inline scripts that must run before first paint. Kept tiny, dependency-free, and wrapped so a
 * failure (blocked storage, an old browser) can never stop the page from rendering.
 */

/**
 * Root: mark that JavaScript runs (image fade-in may hide images only then), and reveal each
 * faded image once it has loaded — or failed, so its alt text shows instead of a blank box.
 */
export const ROOT_HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');function done(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.hasAttribute('data-fade'))t.setAttribute('data-loaded','')}document.addEventListener('load',done,true);document.addEventListener('error',done,true)})();`;

/**
 * Public site: decide whether the intro curtain plays — first visit in this browser session,
 * and only when the visitor has not asked for reduced motion.
 */
export const INTRO_SCRIPT = `(function(){try{if(sessionStorage.getItem('kapucinus-intro-seen'))return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.documentElement.classList.add('intro-pending')}catch(e){}})();`;
