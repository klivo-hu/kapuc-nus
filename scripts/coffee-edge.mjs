// @ts-check
/**
 * Renders the section edges: coffee diffusing into milk.
 *
 * Every transition between a coffee-brown section and its cream neighbours is this image: the
 * section's own brown along one edge, hanging down in slow, curling plumes that thin into the
 * amber, caramel, and milk tones of an iced coffee, with a few splashed drops beyond. It is
 * rendered once at build time, so the browser only decodes a bitmap.
 *
 * How it is built: domain-warped fractal noise (noise whose coordinates are pushed around by more
 * noise, twice over) gives the turbid, folding shapes of milk poured into coffee. A vertical
 * falloff, bent by the same warp so the plumes droop and curl, decides how dense the coffee is;
 * density maps through a colour ramp sampled from a photograph of iced coffee, and the warp
 * fields add the fine darker filaments and milky whorls of the mixing zone.
 */

/** Deterministic PRNG so every build produces the same edges. */
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

/** Seeded 2D gradient noise, roughly in [-1, 1]. */
function gradientNoise(/** @type {number} */ seed) {
  const random = mulberry32(seed);
  const order = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j] ?? 0, order[i] ?? 0];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = order[i & 255] ?? 0;
  const gx = new Float64Array(256);
  const gy = new Float64Array(256);
  for (let i = 0; i < 256; i++) {
    const angle = random() * Math.PI * 2;
    gx[i] = Math.cos(angle);
    gy[i] = Math.sin(angle);
  }
  const fade = (/** @type {number} */ t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (/** @type {number} */ x, /** @type {number} */ y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const a = perm[X + (perm[Y] ?? 0)] ?? 0;
    const b = perm[X + 1 + (perm[Y] ?? 0)] ?? 0;
    const c = perm[X + (perm[Y + 1] ?? 0)] ?? 0;
    const d = perm[X + 1 + (perm[Y + 1] ?? 0)] ?? 0;
    const n00 = (gx[a] ?? 0) * xf + (gy[a] ?? 0) * yf;
    const n10 = (gx[b] ?? 0) * (xf - 1) + (gy[b] ?? 0) * yf;
    const n01 = (gx[c] ?? 0) * xf + (gy[c] ?? 0) * (yf - 1);
    const n11 = (gx[d] ?? 0) * (xf - 1) + (gy[d] ?? 0) * (yf - 1);
    const u = fade(xf);
    const v = fade(yf);
    const top = n00 + (n10 - n00) * u;
    const bottom = n01 + (n11 - n01) * u;
    return (top + (bottom - top) * v) * 1.41;
  };
}

/** Fractal sum of `noise`; each octave is rotated so no grid direction shows. */
function fractal(
  /** @type {(x: number, y: number) => number} */ noise,
  /** @type {number} */ octaves,
) {
  const cos = Math.cos(0.5);
  const sin = Math.sin(0.5);
  return (/** @type {number} */ x, /** @type {number} */ y) => {
    let sum = 0;
    let amplitude = 0.5;
    let px = x;
    let py = y;
    for (let i = 0; i < octaves; i++) {
      sum += amplitude * noise(px, py);
      const nx = (cos * px - sin * py) * 2.03 + 1.7;
      py = (sin * px + cos * py) * 2.03 + 9.2;
      px = nx;
      amplitude *= 0.5;
    }
    return sum;
  };
}

const hex = (/** @type {string} */ value) =>
  [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));

const smoothstep = (
  /** @type {number} */ edge0,
  /** @type {number} */ edge1,
  /** @type {number} */ x,
) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Density → colour, from the faintest wisp (0) to the solid section colour (1). Sampled from the
 * iced-coffee reference: milk, pale gold, amber, caramel, roast, and finally the section's brown.
 * @param {string} solid
 */
function rampTable(solid) {
  const stops = [
    { at: 0.0, color: '#f3dfc0', alpha: 0 },
    { at: 0.12, color: '#efc48e', alpha: 0.28 },
    { at: 0.28, color: '#dd9850', alpha: 0.62 },
    { at: 0.44, color: '#c0743c', alpha: 0.84 },
    { at: 0.6, color: '#8e5029', alpha: 0.96 },
    { at: 0.76, color: '#5e3420', alpha: 1 },
    { at: 0.9, color: solid, alpha: 1 },
    { at: 1.0, color: solid, alpha: 1 },
  ].map((stop) => ({ ...stop, rgb: hex(stop.color) }));
  const size = 1024;
  const table = new Float64Array(size * 4);
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    const upper = Math.max(
      1,
      stops.findIndex((stop) => stop.at >= t),
    );
    const b = stops[upper] ?? stops[stops.length - 1];
    const a = stops[upper - 1] ?? b;
    if (!a || !b) continue;
    const mix = Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at || 1)));
    for (let channel = 0; channel < 3; channel++) {
      const from = a.rgb[channel] ?? 0;
      table[i * 4 + channel] = from + ((b.rgb[channel] ?? 0) - from) * mix;
    }
    table[i * 4 + 3] = a.alpha + (b.alpha - a.alpha) * mix;
  }
  /** Index of a density's colour in `table` (red; green, blue, and alpha follow). */
  const index = (/** @type {number} */ density) =>
    Math.round(Math.min(1, Math.max(0, density)) * (size - 1)) * 4;
  return { table, index };
}

/**
 * @param {{ width?: number, height?: number, seed?: number, solid?: string, reach?: number, drops?: number }} [options]
 *   `reach` (0–1): how far down the plumes travel from the solid edge.
 * @returns {{ data: Buffer, width: number, height: number }} straight-alpha RGBA pixels; the
 *   solid colour runs along the TOP edge.
 */
export function renderCoffeeEdge({
  width = 2880,
  height = 640,
  seed = 3,
  solid = '#402a21',
  reach = 0.7,
  drops = 18,
} = {}) {
  const s = width / 1440;
  const unit = 560 * s;
  const fbmA = fractal(gradientNoise(seed), 4);
  const fbmB = fractal(gradientNoise(seed + 101), 4);
  const fbmC = fractal(gradientNoise(seed + 202), 5);
  const fbmL = fractal(gradientNoise(seed + 303), 3);

  const stops = rampTable(solid);
  const [sr = 0, sg = 0, sb = 0] = hex(solid);
  const milk = hex('#f6e4c6');
  const filament = hex('#5a2f17');
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    const t = y / height;
    // The warp fades in below the edge, so the solid colour is never torn open.
    const freedom = smoothstep(0.0, 0.3, t);
    for (let x = 0; x < width; x++) {
      // The dark mass sinks deeper in some places than others: broad lobes along the edge. They
      // only ever push down, so the solid brown ends along a wandering line, never a straight one.
      const sink = 0.42 * Math.max(0, fbmL(x / (unit * 0.9), 4.1) + 0.42);
      const px = x / unit;
      // Gravity: the field is stretched vertically, so folds hang rather than spread.
      const py = y / (unit * 1.35);
      const qx = fbmA(px, py);
      const qy = fbmB(px + 5.2, py + 1.3);
      const rx = fbmA(px + 2.6 * qx + 1.7, py + 2.6 * qy + 9.2);
      const ry = fbmB(px + 2.6 * qx + 8.3, py + 2.6 * qy + 2.8);
      const v = fbmC(px + 2.4 * rx, py + 2.4 * ry);

      // How far down this column the coffee has sunk, bent by the warp into drooping plumes.
      const bent = t - sink + freedom * (0.36 * ry - 0.3 * qx * qx + 0.06);
      let density = 1 - bent / reach + freedom * 0.42 * v;
      // Pinned to exactly the section colour along the edge, and to nothing at the far edge.
      density += (1 - density) * (1 - smoothstep(0, 0.035, t));
      density *= 1 - smoothstep(0.86, 1, t);

      const index = stops.index(density);
      let red = stops.table[index] ?? sr;
      let green = stops.table[index + 1] ?? sg;
      let blue = stops.table[index + 2] ?? sb;
      let alpha = stops.table[index + 3] ?? 1;

      // The mixing zone: milky whorls and thin darker filaments, as in milk poured over ice.
      const zone = smoothstep(0.1, 0.32, density) * (1 - smoothstep(0.62, 0.8, density));
      if (zone > 0) {
        const whorl = smoothstep(0.16, 0.4, qx * qx + qy * qy) * zone * 0.35;
        red += ((milk[0] ?? 0) - red) * whorl;
        green += ((milk[1] ?? 0) - green) * whorl;
        blue += ((milk[2] ?? 0) - blue) * whorl;
        const contour = Math.abs(rx - 0.04);
        const line = (1 - smoothstep(0.006, 0.04, contour)) * zone * 0.45;
        red += ((filament[0] ?? 0) - red) * line;
        green += ((filament[1] ?? 0) - green) * line;
        blue += ((filament[2] ?? 0) - blue) * line;
        alpha = Math.min(1, alpha + line * 0.25);
      }

      const o = (y * width + x) * 4;
      data[o] = Math.round(red);
      data[o + 1] = Math.round(green);
      data[o + 2] = Math.round(blue);
      data[o + 3] = Math.round(alpha * 255);
    }
  }

  // A few splashed drops beyond the plumes.
  const random = mulberry32(seed * 7919);
  for (let i = 0; i < drops; i++) {
    const cx = random() * width;
    const cy = height * (0.42 + Math.pow(random(), 1.3) * 0.48);
    const radius = (1.1 + Math.pow(random(), 3) * 4.2) * s;
    const stretch = 1 + random() * 0.8;
    const angle = random() * Math.PI;
    const [dr = 0, dg = 0, db = 0] = hex(random() < 0.55 ? '#6a3c24' : '#b8733e');
    const opacity = 0.55 + random() * 0.4;
    const reachX = Math.ceil(radius * stretch + 2 * s);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let y = Math.max(0, Math.floor(cy - reachX)); y < Math.min(height, cy + reachX); y++) {
      for (let x = Math.max(0, Math.floor(cx - reachX)); x < Math.min(width, cx + reachX); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const u = (dx * cos + dy * sin) / (radius * stretch);
        const w = (-dx * sin + dy * cos) / radius;
        const coverage = (1 - smoothstep(0.75, 1.15, Math.sqrt(u * u + w * w))) * opacity;
        if (coverage <= 0) continue;
        const o = (y * width + x) * 4;
        const below = (data[o + 3] ?? 0) / 255;
        const out = coverage + below * (1 - coverage);
        const blend = (/** @type {number} */ top, /** @type {number} */ under) =>
          Math.round((top * coverage + under * below * (1 - coverage)) / out);
        data[o] = blend(dr, data[o] ?? 0);
        data[o + 1] = blend(dg, data[o + 1] ?? 0);
        data[o + 2] = blend(db, data[o + 2] ?? 0);
        data[o + 3] = Math.round(out * 255);
      }
    }
  }

  return { data, width, height };
}
