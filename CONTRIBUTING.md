# Contributing

1. Branch from `main`: `feat/<mechanism-id>` or `fix/<short-description>`.
2. Make the change, following [STYLEGUIDE.md](STYLEGUIDE.md). New movements follow
   [docs/ADDING_A_MECHANISM.md](docs/ADDING_A_MECHANISM.md).
3. Run the same checks as CI:

   ```bash
   npm run check
   ```

   ```bash
   npm run build
   ```

4. Check the change in the browser (`npm run dev`): keyframes, reverse at 0.1×, X-ray mode and a
   375 px wide viewport.
5. Commit with Conventional Commits (`feat(scotch-yoke): …`) and open a PR. The template's
   checklist must be ticked, and CI must be green before merge.

Merges to `main` deploy automatically once CI passes.
