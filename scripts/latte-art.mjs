// @ts-check
/**
 * Renders the intro curtain's latte art: a cup seen from above with a ripple heart poured into
 * the crema.
 *
 * The drawing is authored as SVG and rasterized once at build time, so the browser receives a
 * photograph-like bitmap and runs no drawing code. Realism comes from three things a clip-art
 * rendering lacks: fractal noise for the crema's mottling and the foam's micro-bubbles, a
 * displacement map that makes every foam edge wander the way milk does, and seeded jitter so the
 * heart leans and its ripples bunch unevenly instead of mirroring themselves.
 */

/** Deterministic PRNG so the artwork is identical on every build. */
function mulberry32(/** @type {number} */ seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (/** @type {number} */ n) => n.toFixed(1);

/**
 * A poured heart: two uneven lobes, a shallow notch, and a point dragged out by the pull-through.
 * @param {number} cx @param {number} cy @param {number} w half-width @param {number} h half-height
 * @param {number} lean lobe imbalance, -1..1
 */
function heartPath(cx, cy, w, h, lean) {
  const left = 1 + lean * 0.08;
  const right = 1 - lean * 0.08;
  return [
    `M ${f(cx)} ${f(cy + h * 1.08)}`,
    `C ${f(cx - w * 0.55 * left)} ${f(cy + h * 0.72)} ${f(cx - w * 1.04 * left)} ${f(cy + h * 0.18)} ${f(cx - w * left)} ${f(cy - h * 0.3)}`,
    `C ${f(cx - w * 0.96 * left)} ${f(cy - h * 0.9)} ${f(cx - w * 0.3)} ${f(cy - h * 1.04)} ${f(cx - w * 0.02)} ${f(cy - h * 0.62)}`,
    `C ${f(cx + w * 0.28)} ${f(cy - h * 1.08)} ${f(cx + w * 0.98 * right)} ${f(cy - h * 0.92)} ${f(cx + w * right)} ${f(cy - h * 0.28)}`,
    `C ${f(cx + w * 1.03 * right)} ${f(cy + h * 0.2)} ${f(cx + w * 0.52 * right)} ${f(cy + h * 0.74)} ${f(cx)} ${f(cy + h * 1.08)}`,
    'Z',
  ].join(' ');
}

/**
 * @param {{ size?: number, seed?: number }} [options]
 * @returns {string} an SVG document
 */
export function latteArtSvg({ size = 1600, seed = 7 } = {}) {
  const random = mulberry32(seed);
  const jitter = (/** @type {number} */ amount) => (random() * 2 - 1) * amount;
  const c = size / 2;
  const cupR = size * 0.44;
  const lipR = size * 0.415;
  const coffeeR = size * 0.392;

  const heartX = c + coffeeR * 0.03;
  const heartY = c + coffeeR * 0.02;
  const heartW = coffeeR * 0.6;
  const heartH = coffeeR * 0.56;
  const heart = heartPath(heartX, heartY, heartW, heartH, jitter(1));
  const tilt = -9 + jitter(3);

  const ripples = [];
  const rippleCount = 6;
  for (let k = 1; k <= rippleCount; k++) {
    const scale = 1 - k * 0.125 + jitter(0.012);
    // Each layer sinks toward the point, the inner ones furthest: the wiggle of the jug pushes
    // every layer into the one poured before it, so the lines bunch near the tip.
    const sink = heartH * (0.07 + Math.pow(k, 1.3) * 0.062) + jitter(heartH * 0.015);
    ripples.push({
      d: heartPath(
        heartX + jitter(heartW * 0.025),
        heartY + sink,
        heartW * scale,
        heartH * scale,
        jitter(1),
      ),
      width: size * (0.0078 - k * 0.0004),
      opacity: 0.62 - k * 0.04,
    });
  }

  // The pull-through: the jug's last stroke, from above the notch out through the point.
  const pull = `M ${f(heartX - 3)} ${f(heartY - heartH * 0.66)} C ${f(heartX + 3)} ${f(heartY - heartH * 0.2)} ${f(heartX - 2)} ${f(heartY + heartH * 0.6)} ${f(heartX + 6)} ${f(heartY + heartH * 1.3)}`;

  const rippleStrokes = ripples
    .map(
      ({ d, width, opacity }) =>
        `<path d="${d}" fill="none" stroke="#9c6a3e" stroke-opacity="${opacity.toFixed(2)}" stroke-width="${f(width)}" stroke-linecap="round"/>`,
    )
    .join('\n        ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="ceramic" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#fbf8f3"/>
      <stop offset="70%" stop-color="#efe8de"/>
      <stop offset="100%" stop-color="#ddd2c4"/>
    </radialGradient>
    <radialGradient id="lip" cx="50%" cy="50%" r="50%">
      <stop offset="88%" stop-color="#e6ddd0"/>
      <stop offset="96%" stop-color="#cfc3b3"/>
      <stop offset="100%" stop-color="#f3ede4"/>
    </radialGradient>
    <radialGradient id="crema" cx="50%" cy="52%" r="52%">
      <stop offset="0%" stop-color="#c49b70"/>
      <stop offset="52%" stop-color="#a97646"/>
      <stop offset="78%" stop-color="#8a5630"/>
      <stop offset="94%" stop-color="#5c331b"/>
      <stop offset="100%" stop-color="#a47552"/>
    </radialGradient>
    <radialGradient id="gloss" cx="34%" cy="28%" r="42%">
      <stop offset="0%" stop-color="#fff8ec" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#fff8ec" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${f(size * 0.022)}"/>
    </filter>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="4" seed="${seed}"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.16  0 0 0 0 0.07  0 0 0 2.2 -0.95"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed + 3}"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.11  0 0 0 0 0.05  0 0 0 0.9 -0.35"/>
    </filter>
    <filter id="foam" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0065" numOctaves="2" seed="${seed + 11}" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="${f(size * 0.026)}" xChannelSelector="R" yChannelSelector="G" result="wobbled"/>
      <feGaussianBlur in="wobbled" stdDeviation="${f(size * 0.0024)}" result="soft"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="${seed + 5}" result="bubbles"/>
      <feColorMatrix in="bubbles" type="matrix" values="0 0 0 0 0.82  0 0 0 0 0.72  0 0 0 0 0.6  0 0 0 0.55 -0.12" result="bubbleTint"/>
      <feComposite in="bubbleTint" in2="soft" operator="in" result="bubblesInFoam"/>
      <feMerge><feMergeNode in="soft"/><feMergeNode in="bubblesInFoam"/></feMerge>
    </filter>
    <filter id="halo" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="${f(size * 0.013)}"/>
    </filter>
    <clipPath id="heartShape" transform="rotate(${f(tilt)} ${c} ${c})"><path d="${heart}"/></clipPath>
    <filter id="softLine" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="${f(size * 0.0018)}"/>
    </filter>
    <clipPath id="surface"><circle cx="${c}" cy="${c}" r="${f(coffeeR)}"/></clipPath>
  </defs>

  <ellipse cx="${f(c + size * 0.02)}" cy="${f(c + size * 0.03)}" rx="${f(cupR)}" ry="${f(cupR * 0.98)}" fill="#3b2418" opacity="0.22" filter="url(#shadow)"/>
  <circle cx="${c}" cy="${c}" r="${f(cupR)}" fill="url(#ceramic)"/>
  <circle cx="${c}" cy="${c}" r="${f(lipR)}" fill="url(#lip)"/>

  <g clip-path="url(#surface)">
    <circle cx="${c}" cy="${c}" r="${f(coffeeR)}" fill="url(#crema)"/>
    <rect width="${size}" height="${size}" filter="url(#mottle)" opacity="0.5"/>
    <rect width="${size}" height="${size}" filter="url(#grain)" opacity="0.35"/>
    <g transform="rotate(${f(tilt)} ${c} ${c})">
      <path d="${heart}" fill="#cfa579" opacity="0.6" filter="url(#halo)"/>
      <g filter="url(#foam)">
        <path d="${heart}" fill="#f7efe4"/>
        <g clip-path="url(#heartShape)" filter="url(#softLine)">
          ${rippleStrokes}
        </g>
        <path d="${pull}" fill="none" stroke="#b08050" stroke-opacity="0.5" stroke-width="${f(size * 0.006)}" stroke-linecap="round"/>
      </g>
    </g>
    <circle cx="${c}" cy="${c}" r="${f(coffeeR)}" fill="url(#gloss)"/>
    <circle cx="${c}" cy="${c}" r="${f(coffeeR - 2)}" fill="none" stroke="#3d2213" stroke-opacity="0.45" stroke-width="${f(size * 0.012)}" filter="url(#halo)"/>
  </g>
</svg>`;
}
