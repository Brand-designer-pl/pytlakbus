import type { NextConfig } from 'next';

// Statyczny eksport (GitHub Pages). NEXT_PUBLIC_BASE_PATH ustawia workflow publikacji; lokalnie pusty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;
const config: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};
export default config;
