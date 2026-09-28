'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger, useGSAP);
export { gsap, ScrollTrigger, useGSAP };
export const motion = { duration: 0.8, ease: 'power3.out', stagger: 0.09 } as const;
export const motionOK = '(prefers-reduced-motion: no-preference)';
