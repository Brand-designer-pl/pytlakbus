'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
gsap.registerPlugin(ScrollTrigger, useGSAP);
// Telefony: chowanie paska adresu zmienia wysokość okna — bez przeliczania sceny (unika szarpnięć przy przewijaniu).
ScrollTrigger.config({ ignoreMobileResize: true });
export { gsap, ScrollTrigger, useGSAP };
export const motion = { duration: 0.8, ease: 'power3.out', stagger: 0.09 } as const;
export const motionOK = '(prefers-reduced-motion: no-preference)';
