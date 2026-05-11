# Form Builder

Browser-based form templates with conditional visibility/required rules, numeric calculations, client-side persistence, and an immutable submission archive.

---

## How to run locally

### Prerequisites

- **Node.js** 18+ recommended (matches Vite 5 / tooling expectations).

### Install & dev server

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

### Other commands

| Command | Purpose |
|--------|---------|
| `npm run build` | Typecheck (`tsc -b`) + production bundle (`vite build`). |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint with architectural boundary rules. |
| `npm run typecheck` | TypeScript only (`tsc --noEmit`). |
| `npm run test` | Vitest once (`vitest run`). |
| `npm run test:watch` | Vitest watch mode. |

---

## localStorage schema & reasoning

### Physical keys

Only **two** logical buckets are persisted. Each is stored under a **namespaced key** so multiple schema generations can coexist and migrations stay predictable:

```
fb:v1:templates
fb:v1:submissions
```

Format: `{namespace}:{storageSchemaVersion}:{logicalKey}` — see `fullKey()` in `src/platform/persistence/constants.ts`.

**Why one key per bucket (not one key per template)?**

- **Fewer reads** on dashboard load: one `getItem` returns the whole templates dictionary.
- **Atomic-ish writes** for “save this template”: read dict → merge → write dict (acceptable at current scale).
- If templates become large or numerous, the **`PersistenceAdapter`** seam allows swapping to IndexedDB without changing `templatesService` / `submissionsService` APIs.

### Value shape: versioned envelope

Every stored value is JSON wrapping:

```json
{
  "payloadVersion": 1,
  "writtenAt": "ISO-8601 timestamp",
  "payload": <opaque>
}
```

- **`payloadVersion`** tracks the **payload encoding** inside this envelope. On **read**, `migratePayload` upgrades from stored version → current `STORAGE_SCHEMA_VERSION` (see `src/platform/persistence/migrations`).
- **`writtenAt`** is audit/metadata when the blob was written.

**Why envelope + separate payload version?**

- Bump **storage layout** via migrations **without** renaming keys for every entity type.
- Keeps “how we encode blobs” separate from **domain** `FormDefinition.schemaVersion` (business schema of the form document).

### Payload contents

| Key | `payload` structure |
|-----|---------------------|
| `templates` | `Record<string, FormDefinition>` — keyed by template id. |
| `submissions` | `Record<string, Submission>` — keyed by submission id. |

Malformed entries are **skipped** on read (warn to console) so one bad record does not wipe the entire list.

### Domain versioning vs storage versioning

- **`FormDefinition.schemaVersion` / `version`**: business meaning (document shape and edit revision).
- **`Submission.templateVersion`**: pins which template revision produced this submission.
- **Storage `payloadVersion` / `STORAGE_SCHEMA_VERSION`**: how we wrap and migrate **persisted JSON**, independent of form semantics.

---

## Key architectural decisions & trade-offs

### Layering: domain ↔ platform ↔ services (and the rest)

| Layer | Responsibility |
|-------|----------------|
| **Domain** | Serializable models (`FormDefinition`, `Submission`), pure factories, cross-field **invariants**, parse helpers (`parseFormDefinition`, `parseSubmission`). No React. |
| **Platform** | **Engines** (conditions, calculations, validation), **field plugin registry**, **persistence adapter**. Reusable across features. |
| **Services** | CRUD over templates/submissions using persistence + domain parsers. |
| **Features** | Product flows (builder, filler, dashboard): UI + thin stores/hooks. |
| **App** | Router, loaders, error boundaries. |
| **Shared** | Design-system primitives and tiny helpers. |

**Trade-off:** More folders upfront vs a faster “everything in components” spike. **Benefit:** Logic is unit-testable, field types scale via **plugins** instead of growing switch statements, and **eslint-plugin-boundaries** enforces allowed imports.

### Conditional logic

- **Model:** Conditions are attached **per field** (flat ordered list). Effects apply to **that** field when the predicate is true.
- **Combination:** **Last matching condition wins** per axis (visibility vs required). Predictable; documented in builder UI.
- **Evaluation:** Pure **`evaluateConditions`** in `platform/engines/conditions`; operators live in a **registry** with an explicit **empty-target policy** (inactive when LHS is empty).
- **Trade-off:** Not a full visual rule builder with nested AND/OR groups — simpler mental model and smaller UI/engine surface.

### Component structure & field types

- **`FieldPlugin`** bundles config schema, value schema, builder panel, runtime renderer, display formatting.
- **`PLUGINS`** registry + **`getPlugin(kind)`** centralizes dispatch — adding a type is mostly a new folder under `field-registry/fields/*` plus one registry entry.
- **Trade-off:** Indirection vs raw `switch(kind)` everywhere; payoff when types grow past a handful.

### Fill pipeline

`useFormState` composes **conditions → calculations → validation** so visibility, computed values, and errors stay **derived** from inputs rather than duplicated in store — avoids stale derived state.

---

## What we would improve with more time

- **Backend sync:** Replace single-machine localStorage with API + auth; keep domain/services boundaries so the client remains thin.
- **PDF / export:** Complete end-to-end export pipeline (print/CSS hooks exist; submission read view uses `formatForDisplay` — extend to full PDF generation).
- **Scale:** IndexedDB or chunked storage if templates/submissions grow large; optional incremental condition evaluation using `buildConditionsGraph`.
- **Collaboration:** Operational transforms or locking if multiple authors edit one template.
- **Accessibility & i18n:** Broader audit beyond keyboard-friendly drag handles.

---

## Deploy (static hosting)

This app is a **Vite SPA** (`npm run build` → `dist/`). Connect your Git repo and use:

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node | 18.x or 20.x |

**SPA routing:** Deep links and refresh must fall back to `index.html`. This repo includes:

- **`public/_redirects`** — copied into `dist/` for **Netlify** and **Cloudflare Pages** (`/* → /index.html` with 200).
- **`vercel.json`** — rewrites for **Vercel**.

**Free hosts that fit well:** [Vercel](https://vercel.com), [Netlify](https://netlify.com), [Cloudflare Pages](https://pages.cloudflare.com) — import GitHub repo, set build/output above, deploy.

**Note:** Data lives in **browser localStorage** per **origin**. Deployed URL ≠ `localhost`; users start with empty storage unless you add export/import or a backend later.

---

## AI-assisted development

This repository includes **`AI_USAGE_LOG.md`** — prompts, verification steps, rejected or revised outputs, and notes on architecture discussions with AI tooling.
