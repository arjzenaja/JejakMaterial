# JejakMaterial — Architecture Rules

System structure, layer boundaries, and technical conventions. Read this file before writing any code. It defines **where** things go and **how** the system is composed. For concrete API/DB/logic contracts, see `backend.md`. For workflow, phases, branches, and commits, see `contributing.md`.

Version: 1.0 | Date: 18 November 2026

---

## 1. Locked Tech Stack

The stack is fixed. Do not swap a technology or bump a major version without explicit approval.

| Layer | Technology | Role |
|---|---|---|
| Frontend | Next.js App Router, React, TypeScript | Marketing pages, dashboard, forms, routing |
| Styling | Tailwind CSS | Responsive UI |
| UI | shadcn/ui or internal components, Lucide | Consistent components |
| Backend | Next.js Route Handlers / Server Actions | API and business logic |
| Validation | Zod, React Hook Form | Client and server validation |
| Database | PostgreSQL 16+ | Transactional and relational data |
| ORM | Drizzle ORM + Drizzle Kit | Schema, queries, migrations |
| Auth | Better Auth | Login, session, password auth |
| Runtime / package manager | Bun | Install, scripts, tests, build |
| Charts | Recharts | KPI and trend visualization |
| Testing | Bun Test, Playwright | Unit, integration, E2E |
| Container | Docker + Docker Compose | Dev DB and deployment image |
| Hosting (MVP) | Railway + PostgreSQL | App and DB hosting |
| Version control | Git + GitHub | Collaboration and CI/CD |

Rules:
- Bun is used for install, scripts, tests, and build. The container runtime may use Node.js LTS to run Next.js standalone.
- Compatibility of dependencies is verified in CI before release.
- Do not introduce a library for something the locked stack already provides (e.g. a validation lib when Zod is present, a query builder when Drizzle is present).

## 2. Layer Flow

The system is strictly layered. Requests flow in one direction only.

```
Browser
  |
  v
Next.js UI (App Router)
  |
  +--> Auth / Session (Better Auth)
  |
  +--> API Route Handlers
          |
          +--> Validation (Zod)
          |
          +--> Authorization (tenant + role)
          |
          +--> Services (production, MFCA, reports)
          |
          +--> Repositories (Drizzle ORM)
                    |
                    v
              PostgreSQL
```

Flow: Route receives request → validation checks input → permission checks user and tenant → service runs business rules → repository accesses PostgreSQL.

## 3. Layer Rules

Every layer has a single responsibility. Violating this is the most common source of bugs.

- **Route**: handles HTTP only — parse request, call the pipeline, set the status code and response shape. Routes must not contain business logic.
- **Service**: runs ALL business rules, including MFCA. Logic must live here.
- **Repository**: the only layer that touches the database via Drizzle.
- **MUST NOT** put MFCA or business logic directly in a route file. It belongs in a service.

## 4. Mandatory Folder Structure

Keep code in the defined structure. Do not create ad-hoc top-level folders.

```
src/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (dashboard)/dashboard/
│   └── api/
│       ├── auth/[...all]/
│       └── v1/
│           ├── organizations/
│           ├── facilities/
│           ├── materials/
│           ├── production-runs/
│           ├── dashboard/
│           ├── reports/
│           └── users/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── charts/
│   └── forms/
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── db/
│   ├── validations/
│   └── mfca/
├── server/
│   ├── repositories/
│   ├── services/
│   ├── permissions/
│   └── helpers/
└── types/

tests/
├── unit/
├── integration/
└── e2e/
```

Root files: `.env.example`, `Dockerfile`, `docker-compose.yml`, `drizzle.config.ts`, `next.config.ts`, `package.json`, `bun.lock`.

## 5. Multi-Tenant & Security Principles

Non-negotiable. Every feature must enforce these.

- Every private request validates the session on the server.
- The active organization is determined from the session and a valid membership — never trusted from the request body.
- Every query is scoped by `organization_id`; cross-tenant access is denied.
- Roles are checked on the server, not just by hiding buttons in the UI.
- Use a DB transaction to persist the entire flow in one batch.
- Use audit logs and change history for production data that is already closed.

## 6. Data Conventions

- Base mass unit is **kg**. Any other unit conversion must be explicit and traceable.
- Money and production quantities use **NUMERIC** values processed with decimal arithmetic (e.g. `decimal.js` or a decimal library). JavaScript `number` can cause floating-point rounding; do not use plain floats for money.
- Timestamps use timezone-aware types (`withTimezone`).
- Define every flow category (byproduct, reused material, WIP stock changes, evaporation, moisture, system boundaries) rather than forcing all flows into one category without definition.

## 7. Product Claim Boundaries

Do not over-claim in code, copy, or reports.

- JejakMaterial is an operational tool for companies. It is **not** a certification, environmental audit, or official government reporting tool.
- Company data may support sustainability analysis but is not automatically equal to national indicators DMC (SDG 12.2.2) or Material Footprint (SDG 12.2.1).
- SDG framing is limited to operational contribution; never emit a claim of national achievement from the app.

## 8. File Map

- Structure, layers, conventions, tenant boundaries → this file (`architecture.md`).
- Exact API contract, HTTP statuses, DB schema, MFCA formulas, authorization checklist, test cases → `backend.md`.
- Phases, branch names, commit messages → `contributing.md`.
