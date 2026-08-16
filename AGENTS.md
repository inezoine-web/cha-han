# Repository guide for agents

## Product

`cha-han` is a mobile-first, browser-based wok-toss training prototype. Read
`idea.md` before changing the simulation, then record noteworthy implementation
decisions and test results in `docs/devlog.md`.

## Layout and rules

- Keep editable application code in `progs/`.
- The distributable must remain a single, dependency-free HTML file. Generate
  `release/index.html` from `progs/cha-han.html` with `./scripts/build.sh`; do not
  hand-edit the release copy.
- Put future simulation data and model documentation in `models/`. Add a
  descriptive subdirectory rather than placing model files at the repository root.
- Put operating and design documentation in `docs/`.
- Do not commit browser screenshots, local servers' output, or dependencies.
- Preserve mobile support and provide a pointer/keyboard fallback so development
  does not require a motion-capable device.

## Before finishing

1. Run `./scripts/build.sh` and ensure `git diff --exit-code release/index.html progs/cha-han.html`
   only differs because the source and generated copy have intentionally different paths (normally they are byte-identical).
2. Run `./scripts/check.sh`.
3. For visual changes, serve the repository locally and check `release/index.html`
   with Playwright 1.62.1 using installed Google Chrome (`--channel chrome`).
4. Update `docs/devlog.md`, commit the generated release file with its source,
   and keep GitHub Pages publishing from `release/` via the workflow.
