# Style guide

One guide for code, visuals and copy, so every movement feels like part of the same book.
Most rules are enforced by tooling or tests; the rest are checked in review.

## 1. Code

| Rule                                                                         | Enforced by                       |
| ---------------------------------------------------------------------------- | --------------------------------- |
| Prettier formatting (100 cols, single quotes, trailing commas, LF)           | `npm run format:check`            |
| ESLint recommended + typescript-eslint + react-hooks, zero warnings          | `npm run lint`                    |
| `strict` TypeScript with `noUncheckedIndexedAccess`; `import type` for types | `npm run typecheck`, lint         |
| UTF-8, LF, 2-space indent, final newline                                     | `.editorconfig`, `.gitattributes` |

**Naming**

- Folders and mechanism ids: `kebab-case` (`geneva-drive`). Ids are URL slugs and must never change once published.
- React components: `PascalCase.tsx`. Hooks: `useThing.ts`. Plain modules: `camelCase.ts`.
- Constants describing geometry: `SCREAMING_SNAKE_CASE`, with a doc comment giving the formula
  when it is derived (e.g. `/** Centre distance C = a / sin(π/n). */`).

**Architecture rules**

1. **Motion is a pure function of θ.** `kinematics.ts` exports functions of the unbounded driver
   angle θ (radians). No accumulated state, no `Date.now()`, no React. This is what keeps
   scrubbing, reverse and keyframe jumps exact.
2. **No React state per frame.** Models pose refs inside `usePhaseFrame`. UI readouts sample the
   clock at ≤ 20 Hz (`useTheta`).
3. **Geometry is generated from the same maths that drives it** (gear flanks from the involute,
   cam surface from the displacement law, Geneva proportions from the slot count).
4. **Every kinematics file has a test** asserting the physical claim the model makes: ratio,
   contact without interference, dwell, one-way motion. Prefer geometric checks (point-in-polygon,
   clearance) over snapshot numbers.
5. Mechanisms are modelled in the **XY plane facing +Z**, input shaft at or near the origin,
   1 scene unit ≈ 25 mm.

## 2. Visual language

All values live in `src/styles/tokens.css` (CSS) and `src/core/roles.ts` (3D). Do not hard-code
colours in components.

**Role colours** — the core teaching device. Use them consistently and only for their meaning.

| Role           | Token                 | Hex       | Use for                                     |
| -------------- | --------------------- | --------- | ------------------------------------------- |
| Input / driver | `--role-driver`       | `#f2a33a` | The part that receives power from outside   |
| Intermediate   | `--role-intermediate` | `#4f9cf0` | Parts that transmit or transform motion     |
| Output         | `--role-output`       | `#3fc28a` | The part that delivers the converted motion |
| Frame          | `--role-frame`        | `#8592a3` | Fixed parts: bearings, guides, base         |

- Amber doubles as the interface accent ("ink"). Green also marks keyframes and plots, because
  they describe the output.
- Surfaces are blueprint navy (`--bg` → `--surface-3`). Lines are 1 px `--line`.
- Type: system sans for prose, system monospace for numbers, angles, movement numbers and motion
  tags. Numbers use tabular figures (`.mono`).
- Spacing follows the 4 px scale (`--sp-1` … `--sp-6`).
- Interactive states: hover lifts the surface one step; pressed/selected uses
  `--accent` + `--accent-soft`; focus is always a visible 2 px `--focus` outline.
- Respect `prefers-reduced-motion`: animations start paused and UI transitions are disabled.

**3D conventions**

- Each physical part is wrapped in `<Part role name>` and uses `<RoleMaterial />`, so hover
  labels, X-ray and wireframe modes work without per-model code.
- Moving parts sit in front of a frame plate with a foot; set `camera.floorY` to the foot's
  underside.
- Show rotation: add an index mark or asymmetric feature (holes, arms) to anything that spins.

## 3. Writing

Audience: curious non-specialists and students. Plain words first, then the technical term.

| Field          | Rule                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | Common modern name. Add Brown's term in parentheses if it differs ("Cam and Follower (Heart Cam)")                                       |
| `number`       | Verified against 507movements.com. If no exact match, use the nearest plate and say how it differs in `referenceNote`                    |
| `motion`       | `from` / `to` from this list: Rotary, Continuous rotary, Oscillating, Reciprocating, Intermittent rotary (qualifiers allowed: "one-way") |
| `summary`      | One sentence, ≤ 140 characters, says what moves what                                                                                     |
| `howItWorks`   | 1–2 short paragraphs, ≤ 150 words total. Describe the force path from driver to output, then the key property (ratio, dwell, lock)       |
| `applications` | One-line summary + **2–3** everyday examples, sentence case, no trailing full stop                                                       |
| `keyframes`    | Short labels naming the instant ("Pin enters slot · wheel unlocks"); use `·` to join two facts                                           |

House style: British/Commonwealth spelling as in Brown ("centre"), curly quotes, en/em dashes,
`°` for angles, `×` for speed multipliers, `→` in motion tags. The registry test enforces the
length and count limits.

## 4. Commits and branches

- Conventional Commits: `feat(geneva): add 6-slot variant`, `fix(viewer): …`, `docs: …`,
  `test: …`, `chore(deps): …`. Scope is the mechanism id or the area (`viewer`, `ui`, `ci`).
- Branch names: `feat/<id>`, `fix/<short-description>`.
- `main` is always deployable: CI must be green before merge; deploy runs only after CI succeeds.
