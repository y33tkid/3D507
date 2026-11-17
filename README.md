# 507 Mechanical Movements — in 3D

Interactive, animated 3D models of the movements in Henry T. Brown's
_Five Hundred and Seven Mechanical Movements_ (1868), the book transcribed at
[507movements.com](https://507movements.com/). Each movement is a procedural, mathematically
exact model you can orbit, slow down, reverse and scrub frame by frame.

## Movements so far

| # (Brown) | Movement                                               | Category               | Motion                                    |
| --------- | ------------------------------------------------------ | ---------------------- | ----------------------------------------- |
| 24        | Spur Gears: 18 : 36 involute pair                      | Gears                  | Rotary → Rotary                           |
| 75        | Ratchet and Pawl: lever, driving pawl and holding pawl | Ratchets & Escapements | Oscillating → Intermittent one-way rotary |
| 93        | Scotch Yoke                                            | Linkages               | Rotary → Reciprocating                    |
| 96        | Cam and Follower: heart cam, roller follower           | Cams                   | Rotary → Reciprocating                    |
| 212       | Geneva Drive: 4-slot external                          | Ratchets & Escapements | Continuous rotary → Intermittent rotary   |

## Features

- **3D viewer** (Three.js via React Three Fiber): orbit, zoom and pan, with camera presets
  (Iso / Front / Top / Side), Reset, and framing that adapts to narrow screens.
- **Playback**: play/pause, 0.1×–2× speed, reverse, ±1° stepping, and a cycle scrubber with
  clickable keyframes (dead centres, engagement, lock).
- **Inspection**: role colour coding (driver / intermediate / output / frame), hover to name a
  part, and Solid / X-ray / Wireframe modes.
- **Learning content**: Brown's number, a motion-conversion tag, how it works, real-world
  applications, a live plot of the output against the input angle, and a link to the original plate.
- **Catalogue**: search (by name, `#number`, motion or example) and category filters.
  Deep links use `#/m/<id>`.
- **Keyboard**: `Space` play, `R` reverse, `←/→` step, `[ ]` speed, `1–4` views, `0` reset,
  `W` render mode, `/` search.

## Getting started

Requires Node 20.11+ (see `.nvmrc`).

```bash
npm install
```

```bash
npm run dev
```

| Script            | Does                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server at <http://localhost:5173>                          |
| `npm run build`   | Typecheck and production build to `dist/`                           |
| `npm run preview` | Serve the production build                                          |
| `npm test`        | Kinematics and registry tests (Vitest)                              |
| `npm run check`   | Everything CI runs except the build: format, lint, typecheck, tests |
| `npm run format`  | Apply Prettier                                                      |

## Architecture

```
src/
  core/         types, phase clock, maths and geometry helpers, role colours, search filter
  store/        zustand UI state (playback, render mode, camera requests, selection)
  viewer/       Canvas, camera rig, clock driver, <Part>/<RoleMaterial>, shared parts
  ui/           catalogue, info panel, playback bar, toolbar, motion plot, hooks
  mechanisms/   one folder per movement + registry (index.ts) + glTF adapter
  styles/       tokens.css (design tokens) and app.css
```

**One clock, pure poses.** A single unbounded driver angle θ (`core/phase.ts`) is the only
time-varying value. `ClockDriver` advances it each frame by speed × direction. The scrubber,
step buttons and keyframes set it directly. Every model computes its pose as a pure function of
θ (`kinematics.ts`), so reverse, slow motion and scrubbing are exact and testable without a GPU.
React never re-renders per frame.

**Modular mechanisms.** Each movement is lazy-loaded from its own folder. Procedural and `.glb`
models share the same contract. See [docs/ADDING_A_MECHANISM.md](docs/ADDING_A_MECHANISM.md).

**Accuracy is tested.** The tests check that the involute gears mesh without interference
through a full tooth pitch, and that the Geneva pin enters tangentially and the locking disc
clears the wheel (with a negative control). They also check that the cam surface touches the
roller at every angle without penetration, that the ratchet never turns backwards, and that the
yoke's slot and rod guides cover the full stroke.

## CI/CD

- **CI** (`.github/workflows/ci.yml`) runs on every push to `main` and every PR: format check,
  lint, typecheck, tests and build, and uploads `dist` as an artifact.
- **Deploy** (`.github/workflows/deploy.yml`) publishes to GitHub Pages only after CI succeeds
  on `main`, or on manual dispatch. It builds with `BASE_PATH=/<repo>/`; set the repository
  variable `BASE_PATH` (e.g. `/`) for a custom domain. Enable it under _Settings → Pages →
  Source: GitHub Actions_.
- **Dependabot** groups weekly npm updates (Three.js stack and tooling) and monthly Actions
  updates.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [STYLEGUIDE.md](STYLEGUIDE.md).

## Troubleshooting

- **`Cannot find module @rollup/rollup-…`** after `npm install`: this is an npm bug with
  optional dependencies. Delete `node_modules` and `package-lock.json`, then run `npm install`
  again. Alternatively, install the missing package with `--no-save`.

## Credits

Movement numbers, titles and descriptions follow Henry T. Brown, _507 Mechanical Movements_
(1868), which is in the public domain. Thanks to 507movements.com for the online edition.
The 3D models and text here are original.
