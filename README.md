# Kaustubh Krishna / Portfolio

Static founder portfolio with a short application-facing overview, seven robotics case studies and three archived experiments. The homepage pairs an ICRA qualification result with three selected engineering summaries: industrial evidence, robot learning and measured control. Each summary states the outcome, mechanism and available evidence. Project pages keep a concise overview and an expandable technical deep dive, with measurements and competition records visible outside the disclosure.

The current company remains in stealth. Industry 6.0 is framed as a long-term direction; the research page lists technical questions and evaluation criteria. Biography, timeline and original early robotics footage live in About.

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
- `scripts/evidence.mjs`: measured results, method notes and artifact links.
- `scripts/plot-evidence.py`: reproducible control charts from `content/evidence/` (requires matplotlib).
- `scripts/engineering.mjs`: project architecture diagrams, world-model research map and technical inspectors.
- `styles.css`: responsive design.
- `app.js`: accessible video controls and keyboard-operable technical tabs.
- `scripts/build.mjs`: renders static HTML into the checkout and `dist/`, copies only explicitly selected public assets, generates metadata and prunes retired build outputs.

The generated HTML is committed as ordinary static pages. Edit the source files above and rebuild instead of editing generated pages directly.

## Content boundaries

The current company is described only as a stealth Physical AI startup. Selected private projects have technical descriptions without repository links or source. Industry 6.0 and autonomous factories are the direction being built toward. The racing placement is third in qualification, with the later final-round result explained in the project.

The owner confirmed MPCC comparison, modified PPO/SAC and multi-head attention work in the private local racing and golf-cart codebases. The golf-cart deployment is a separate physical-vehicle case study; ICRA timings belong only to the simulator competition.

## Publishing and public URLs

Canonical metadata targets `https://kaustubhkr.github.io/`. Internal links are relative, so the site also works under a repository subpath. The old `rlx-core.html` route redirects to the current RL project. Résumé pages and downloads have been retired; they are not included in the public build. Contact email is `kaustubhkr.work@gmail.com`. Age is confined to About, and education dates are omitted.

The production repository is `kaustubhkr/kaustubhkr.github.io`. Pushes to `main` run the build and validation checks, then publish only `dist/` through GitHub Actions. The previous project URL is maintained as a redirect to the account-root site. `migration/legacy-index.html` is a prepared redirect for that old location; deploy it there only after the new root site is verified live. Do not deploy the redirect at the new root.

Deploy the `dist/` artifact to publish only the reviewed files. The source checkout includes build tooling and is not the deployment artifact.

## Agent-readable portfolio

`full-context.html` combines all 15 content pages into one static reading surface. `llms-full.txt` contains the same public copy as plain text with absolute source, evidence and media URLs; `llms.txt` provides the reading index. Every technical tab and collapsed deep dive is included. These files are derived from the rendered pages on every build, so there is no separately maintained biography or project summary to drift.

Every page links to the full-context view in its footer and exposes the plain-text alternate in its HTML head. The full-context page is in the sitemap; existing robots rules allow crawling. Agent discovery and retrieval remain dependent on the browsing tool, so the full-context URL is the most direct single-link option.

The homepage includes a direct agent-reading prompt. The reading guide explains full-text retrieval, the HTML fallback, source attribution and truncation recovery; both aggregate formats end with an explicit completion marker. After every GitHub Pages deployment, `scripts/check-live.mjs` verifies public content hashes, HTTP content types, crawler user-agent access and video byte ranges. It checks reachability, not vendor indexing or uptime guarantees.

A raw GitHub mirror of `llms-full.txt` provides the same content on a second host when a reader cannot retrieve GitHub Pages. The live verification also checks that mirror against the deployed build.
