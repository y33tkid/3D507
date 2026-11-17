# Adding a mechanism

Each movement is a self-contained folder in `src/mechanisms/` plus one line in the registry.

```
src/mechanisms/<id>/
  kinematics.ts       pure maths: geometry + pose as functions of θ
  kinematics.test.ts  proves the physical claims
  Model.tsx           React Three Fiber scene, poses refs from kinematics
  meta.ts             title, Brown number, copy, parts, keyframes, plot, camera
```

## 1. Look up the reference

Find the plate on <https://507movements.com/toc.html> (pages are `mm_NNN.html`). Record the
number. If your model differs from Brown's drawing, write one sentence in `referenceNote`.

## 2. Write `kinematics.ts`

- Export constants with formula comments and pure functions of the unbounded driver angle
  `theta` (radians, one cycle = 2π).
- For anything periodic or stepped, compute the cycle index (`Math.floor(theta / TAU)`) and
  derive the pose in closed form. Never accumulate. This makes reverse and scrubbing exact.
- Generate outlines (`Vec2[]`) here, not in the component, so tests can check them.

Helpers: `src/core/math.ts` (`wrapPi`, `mod`, `rotate`, `polar`, `pointInPolygon`,
`distanceToPolygon`) and `src/core/phase.ts` (`TAU`).

## 3. Test it

Assert what the model claims physically, for example:

- ratio or stroke (`followerAngle(1) - followerAngle(0)`)
- contact without interference across a cycle (point-in-polygon on placed outlines)
- dwell / one-way behaviour / continuity across cycle boundaries
- a negative control showing the check can fail (see the Geneva test)

## 4. Build `Model.tsx`

```tsx
export default function MyModel() {
  const crank = useRef<Group>(null);
  const geo = useMemo(() => extrudeOutline(myOutline(), 0.2), []);
  usePhaseFrame((theta) => {
    crank.current?.rotation.set(0, 0, crankAngle(theta));
  });
  return (
    <group>
      <BackPlate width={4} height={3} />
      <FixedShaft x={0} y={0} />
      <group ref={crank}>
        <Part role="driver" name="Crank">
          <mesh geometry={geo} castShadow>
            <RoleMaterial />
          </mesh>
        </Part>
      </group>
    </group>
  );
}
```

- Default export (it is lazy-loaded).
- Wrap every physical part in `<Part role name>` and use `<RoleMaterial />`, so colour coding,
  hover labels and the X-ray and wireframe modes work automatically.
- Model in the XY plane, facing +Z.

### Using a `.glb` / `.gltf` instead

Put the file in `public/models/` and use the adapter. Motion still comes from a pure pose
function:

```tsx
import { createGltfModel } from '../gltf/createGltfModel';
import { crankAngle, sliderX } from './kinematics';

export default createGltfModel({
  url: `${import.meta.env.BASE_URL}models/my-movement.glb`,
  roles: { Crank: 'driver', Rod: 'intermediate', Slider: 'output', Base: 'frame' },
  pose: (theta) => ({
    Crank: { rotation: [0, 0, crankAngle(theta)] },
    Slider: { position: [sliderX(theta), 0, 0] },
  }),
});
```

Name the nodes in your modelling tool exactly as in `roles`/`pose`. Put each moving node's
origin on its axis of rotation.

## 5. Write `meta.ts`

Follow [STYLEGUIDE.md › Writing](../STYLEGUIDE.md#3-writing). Set:

- `camera.target` (orbit centre), `camera.distance` (landscape framing), `camera.width`
  (overall width, used to fit narrow screens) and `camera.floorY` (underside of the frame foot)
- `keyframes` at the instants worth inspecting (dead centres, engagement, lock)
- `plot.sample(theta)`: the output quantity a student should watch

Use `Model: lazy(() => import('./Model'))`.

## 6. Register and check

Add the definition to `MECHANISMS` in `src/mechanisms/index.ts`, then:

```bash
npm run check
```

```bash
npm run dev
```

In the browser: jump to every keyframe, play in reverse at 0.1×, try X-ray mode, and check a
375 px wide viewport.
