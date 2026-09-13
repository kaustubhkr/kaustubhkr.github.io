# Kaustubh Krishna / Portfolio

Static founder portfolio with nine engineering case studies, an Industry 6.0 direction page, biography and original project footage. The homepage leads with a second Physical AI company in stealth and ICRA autonomous racing. The RLx-Core page includes interactive world-model, policy-optimisation and runtime-contract views.

## Local review

```sh
npm run dev
```

Open `http://127.0.0.1:4318/`. The server binds only to this machine and serves the allowlisted `dist/` build. Source changes trigger a rebuild; refresh the browser to see them.

```sh
npm run build
npm run check
```

Node 22 or newer. No npm dependencies are needed. Fonts load from Google Fonts with local system fallbacks.

## Editing

- `content/projects.json`: case-study copy, technical bullets, public implementation links and project context.
- `scripts/render.mjs`: homepage, project templates, biography and direction HTML.
- `scripts/engineering.mjs`: project architecture diagrams, world-model research map and technical inspectors.
- `styles.css`: responsive design.
- `app.js`: accessible video controls and keyboard-operable technical tabs.
- `scripts/build.mjs`: renders static HTML into the checkout and `dist/`, copies only explicitly selected public assets, generates metadata and prunes retired build outputs.

The generated HTML is committed as ordinary static pages. Edit the source files above and rebuild instead of editing generated pages directly.

## Content boundaries

The current company is described only as a stealth Physical AI startup. Selected private projects have technical descriptions without repository links or source. Industry 6.0 and autonomous factories are the direction being built toward. The racing placement is third in qualification, with the later final-round result explained in the project.

The MPCC experience is included in the technical profile. Its exact project association remains to be supplied by the owner before expanding it into a separate case study.

## Publishing and public URLs

Canonical metadata targets `https://kaustubhkr.github.io/`. Internal links are relative, so the site also works under a repository subpath. The old `rlx-core.html` route redirects to the current RL project. Résumé pages and downloads have been retired; they are not included in the public build. Contact email is `kaustubhkr.work@gmail.com`. Age is confined to About, and education dates are omitted.

The production repository is `kaustubhkr/kaustubhkr.github.io`. Pushes to `main` run the build and validation checks, then publish only `dist/` through GitHub Actions. The previous project URL is maintained as a redirect to the account-root site. `migration/legacy-index.html` is a prepared redirect for that old location; deploy it there only after the new root site is verified live. Do not deploy the redirect at the new root.

Deploy the `dist/` artifact to publish only the reviewed files. The source checkout includes build tooling and is not the deployment artifact.
