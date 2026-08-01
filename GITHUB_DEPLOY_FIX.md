# GitHub deployment fix — v0.8.1

The v0.8 UI introduced tabbed rider, team, and director pages and intentionally increased Grand Tour Hall of Fame weighting. The application worked locally, but three regression tests still asserted the old v0.7 markup and old Hall of Fame balance. GitHub Pages correctly stopped at `npm test`.

This patch updates the test render helpers to select a profile tab explicitly and updates the assertions to match the v0.8 design. No save data or simulation behavior is changed.

Validated locally in the provided environment: `npm test` — 12/12 passing. The production build could not be rerun in the sandbox because its internal npm mirror did not expose `@vitejs/plugin-react`; GitHub Actions uses the public npm registry and had already installed the dependencies successfully before reaching the tests.
