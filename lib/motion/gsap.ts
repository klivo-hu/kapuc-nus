'use client';

/**
 * The project's one GSAP registration site.
 *
 * Registering in a single module is what makes the plugins survive tree-shaking in a production
 * build, and it keeps the motion setup owned by one file rather than repeated wherever an
 * animation happens to be written. Import GSAP from here, never from 'gsap' directly.
 */

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * The motion level this surface is built at (0-4). Effects declaring a higher minimum level are
 * skipped rather than downgraded: a dashboard does not get a quieter pinned section, it gets none.
 */
export const MOTION_LEVEL = 2;

/** The media query the motion branch runs under. Anything else gets the finished state. */
export const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export { gsap, ScrollTrigger, SplitText, useGSAP };
