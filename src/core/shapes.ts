import { ExtrudeGeometry, Path, Shape, Vector2 } from 'three';
import type { Vec2 } from './math';

export interface CircularHole {
  c: Vec2;
  r: number;
}

/** A hole is either a circle or a closed polygon. */
export type Hole = CircularHole | Vec2[];

/** Build a Three.js Shape from an outline, with optional circular holes. */
export function shapeFromOutline(outline: Vec2[], holes: Hole[] = []): Shape {
  const shape = new Shape(outline.map(([x, y]) => new Vector2(x, y)));
  for (const h of holes) {
    if (Array.isArray(h)) {
      shape.holes.push(new Path(h.map(([x, y]) => new Vector2(x, y))));
    } else {
      const p = new Path();
      p.absarc(h.c[0], h.c[1], h.r, 0, Math.PI * 2, true);
      shape.holes.push(p);
    }
  }
  return shape;
}

/** Extrude a planar outline along +Z, centred on z = 0, with a small bevel. */
export function extrudeOutline(
  outline: Vec2[],
  depth: number,
  holes: Hole[] = [],
  bevel = 0.012,
): ExtrudeGeometry {
  const core = depth - bevel * 2;
  const geo = new ExtrudeGeometry(shapeFromOutline(outline, holes), {
    depth: core,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 1,
    curveSegments: 24,
  });
  geo.translate(0, 0, -core / 2);
  geo.computeVertexNormals();
  return geo;
}
