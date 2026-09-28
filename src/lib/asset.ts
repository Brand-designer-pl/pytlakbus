// Prefiks ścieżki dla publikacji pod podkatalogiem (GitHub Pages: /pytlakbus). Lokalnie pusty.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const asset = (path: string) => `${basePath}${path}`;
