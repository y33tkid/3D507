/**
 * 3D scene colours. Mirrors the surface tokens in styles/tokens.css
 * (STYLEGUIDE.md › Visual language); components must not hard-code colours.
 */
export const SCENE = {
  background: '#0d1520', // --bg
  hemisphereSky: '#dfe9ff',
  hemisphereGround: '#1a2330',
  rimLight: '#9fc2ff',
  gridCell: '#1d2c3d',
  gridSection: '#2b4560',
  /** Engraved index marks on rotating parts. */
  marking: '#1b2633',
} as const;
