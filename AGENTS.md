# Repository Guidelines

## Project Structure & Module Organization
Domain logic lives in `app/`, routes in `routes/*.php`, and configuration inside `config/`. Inertia + React assets sit in `resources/js` (Pages, Components, Hooks), shared styles in `resources/css`, and Blade fallbacks in `resources/views`. Database migrations, factories, and seeders stay under `database/`, while Pest suites pair `tests/Feature` with `tests/Unit`. Vite output lands in `public/`, and tooling configs (`vite.config.ts`, `eslint.config.js`, Pint) remain at the repo root for quick lookup.

## Build, Test, and Development Commands
- `composer run setup` — install PHP/Node deps, provision `.env`, run migrations, and build assets.
- `composer run dev` — concurrent dev stack: `php artisan serve`, queue worker, Pail logs, and `npm run dev`.
- `npm run build` or `npm run build:ssr` — generate production bundles, optionally with SSR artifacts.
- `npm run format` / `npm run lint` / `npm run types` — Prettier, ESLint (React+Tailwind), and TypeScript safety nets.
- `./vendor/bin/pint` — PSR-12 formatting for PHP before committing.

## Coding Style & Naming Conventions
Follow PSR-12 with 4-space indentation in PHP and keep namespaces aligned with folders. React + TypeScript files use 2-space indentation, PascalCase components, camelCase hooks/utilities, and route-aligned directories (`resources/js/Pages/Dashboard/Index.tsx`). Prefer functional components, explicit prop interfaces, and Tailwind classes kept sorted via `prettier-plugin-tailwindcss`; favor descriptive filenames over generic `index.tsx`.

## Testing Guidelines
`composer test` clears cached config and runs Pest via `php artisan test`. Create behavior-first specs named `<Feature>Test.php` (e.g., `EnrollUserTest`) in `tests/Feature`, and isolate helpers or policies in `tests/Unit`. Mock queues, notifications, and third-party SDKs with Laravel fakes so suites stay deterministic, then note any required manual verification in the PR.

## Commit & Pull Request Guidelines
Commits follow conventional prefixes seen in history (`feat:`, `fix:`, `chore:`, automated `bd sync`). Keep subject lines under 72 characters and explain intent plus risk in the body. Each PR must reference a Beads issue, summarize changes, list verification commands (`php artisan test`, `npm run build`), and attach UI screenshots or screencasts when user-facing surfaces move.

## Agent Workflow & Issue Tracking
This repo relies on Beads (`bd`) for work intake. Run `bd ready` to discover tasks, `bd show <id>` for requirements, `bd update <id> --status in_progress` when coding, and `bd close <id>` once the fix is verified. Always `bd sync` before you push or request a review so Git and the tracker stay in lockstep.
