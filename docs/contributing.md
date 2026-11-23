# JejakMaterial — Contribution & Workflow Rules

Branch naming, commit convention, and the phase plan. Read this before starting any work. It defines **how** to structure branches, commits, and delivery phases so the workflow stays predictable.

Version: 1.0 | Date: 18 November 2026

---

## 1. Branch Naming

Format: `be/<type>/<change>` — all lowercase, kebab-case.

Types:
- `be/feat/<change>` — new feature
- `be/fix/<change>` — bug fix
- `be/chore/<change>` — setup, tooling, maintenance
- `be/docs/<change>` — documentation
- `be/test/<change>` — tests
- `be/refactor/<change>` — refactor with no behavior change

Examples:
- `be/feat/production-runs-create`
- `be/fix/auth-session-validation`
- `be/chore/project-setup`
- `be/docs/api-contract`
- `be/test/mfca-calculator`
- `be/refactor/material-repository`

## 2. Commit Convention

Use Conventional Commits, English, imperative mood (as an instruction, not a description). One logical change per commit.

```
<type>(<scope>): <short summary>
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`.

Examples:
- `feat(runs): add production run creation endpoint`
- `fix(auth): validate session before organization resolution`
- `chore(setup): scaffold next.js app router`
- `docs(api): document response envelope`
- `test(mfca): cover efficiency and loss rate cases`
- `refactor(flows): move logic from route to service`

## 3. Phase Plan

One branch per phase. Work phases in order. Do not skip ahead.

### Phase 0 — Project Setup
- **Branch:** `be/chore/project-setup`
- Commits:
  - `chore(setup): scaffold next.js app router with typescript and tailwind`
  - `chore(tooling): add eslint and typecheck scripts`
  - `chore(deps): add drizzle, zod, dotenv, recharts, lucide`

### Phase 1 — Database + Auth
- **Branch:** `be/feat/database-auth`
- Commits:
  - `feat(db): add drizzle schema and migrations`
  - `feat(auth): configure better-auth with drizzle adapter`
  - `feat(auth): add sign-in and session handling`

### Phase 2 — Organization + RBAC
- **Branch:** `be/feat/org-rbac`
- Commits:
  - `feat(org): add organization create and profile endpoints`
  - `feat(membership): add membership and invitation endpoints`
  - `feat(rbac): enforce role checks server-side`

### Phase 3 — Facilities + Materials
- **Branch:** `be/feat/facilities-materials`
- Commits:
  - `feat(facilities): add facility crud endpoints`
  - `feat(materials): add material crud with decimal cost`
  - `feat(materials): enforce tenant scoping on material queries`

### Phase 4 — Production Runs
- **Branch:** `be/feat/production-runs`
- Commits:
  - `feat(runs): add create and list production runs`
  - `feat(runs): add update draft endpoint`
  - `feat(runs): enforce draft status rules`

### Phase 5 — Material Flow
- **Branch:** `be/feat/material-flow`
- Commits:
  - `feat(flows): add flow entry endpoint`
  - `feat(flows): resolve price from database in transaction`
  - `feat(flows): validate flow types and quantities`

### Phase 6 — Material Balance
- **Branch:** `be/feat/material-balance`
- Commits:
  - `feat(balance): add variance calculation`
  - `feat(runs): close run only when balanced`
  - `test(balance): cover close-with-variance case`

### Phase 7 — MFCA Cost Analysis
- **Branch:** `be/feat/mfca-analysis`
- Commits:
  - `feat(mfca): add loss cost calculator`
  - `feat(mfca): add run analysis endpoint`
  - `test(mfca): cover efficiency and loss rate cases`

### Phase 8 — Dashboard + Reports
- **Branch:** `be/feat/dashboard-reports`
- Commits:
  - `feat(dashboard): add kpi summary endpoint`
  - `feat(reports): add mfca report filter`
  - `feat(reports): add export endpoint`

### Phase 9 — Testing + Security
- **Branch:** `be/test/security-suite`
- Commits:
  - `test(api): cover auth and tenant isolation`
  - `fix(security): enforce org scoping on all queries`
  - `test(e2e): add end-to-end production flow`

### Phase 10 — Pilot Deployment
- **Branch:** `be/chore/deploy-pilot`
- Commits:
  - `chore(deploy): add production dockerfile`
  - `chore(deploy): add railway configuration`
  - `docs(deploy): add setup and backup guide`

## 4. Pull Request Rules

- One phase (one branch) per PR. Do not combine phases.
- Branch must be pushed from the phase branch named per Section 1.
- Squash-merge into the target branch.
- PR title uses the Conventional Commit format from Section 2.
- The PR body links the phase and lists the Definition of Done items it satisfies.
- CI must pass (typecheck, lint, build, unit + e2e tests) before merge.
