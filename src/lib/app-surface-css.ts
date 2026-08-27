/** Chat/feed/app Tailwind. Must not load on guest `/`. */
export function shouldLoadAppSurfaceStyles(pathname: string): boolean {
  return pathname !== "/";
}
