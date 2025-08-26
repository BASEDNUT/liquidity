Surgical refactor plan: stabilize AI features, harden env management, and de-risk deployments

Objectives
- Restore AI features by isolating all model/provider config in env and a single model registry.
- Eliminate secret leakage into the client bundle; keep keys server-only.
- Normalize error handling, timeouts, and logging for Venice and Redis calls.
- Add simple verifications so we can tell quickly if the system is healthy.

What we’ll change (precise and minimal)
1) Environment schema and enforcement
	- Add an .env.example (no secrets) with all required vars and sane defaults.
	- Expand `utils/validateEnv.js` to validate:
	  - VENICE_API_KEY
	  - VENICE_CHAT_MODEL, VENICE_IMAGE_MODEL_DEFAULT, VENICE_IMAGE_MODELS (CSV)
	  - UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (required if warmachine/Redis features are enabled)
	  - LOG_LEVEL, REQUEST_TIMEOUT_MS (optional with defaults)
	- Fail fast in production; warn in local dev.

2) Central model registry
	- Create a tiny `utils/modelCatalog.js` that reads env and exports:
	  - chatModel: string
	  - image: { defaultModel: string, allowedModels: string[] }
	  - helpers to validate incoming model selections from the UI.
	- Replace scattered hard-coded models with reads from the catalog.

3) Do not expose secrets to the client
	- Remove VENICE_API_KEY (and any secrets) from `next.config.js` `env`/`publicRuntimeConfig`.
	- API routes access process.env directly on the server.

4) API hardening (Venice + Redis)
	- Standardize timeouts via `REQUEST_TIMEOUT_MS` (AbortController already used; centralize the value).
	- Normalize error shapes from Venice chat/image endpoints:
	  - { error: string, details?: any, status?: number }
	- Add defensive parsing for Venice responses (choices/reply/text) with clear fallbacks.
	- Gate Redis features behind env check; return 503 with actionable message if not configured.

5) Observability
	- Add LOG_LEVEL with basic levels: error | warn | info | debug.
	- Reduce PII/secret logging; never log raw keys or tokens.
	- Add a lightweight `/api/health` that checks:
	  - process.env schema valid (no secrets in response)
	  - Redis connectivity if configured
	  - returns { ok: true, features: {...} }

6) Build/runtime safety
	- Keep `validateEnv()` in Next config but ensure it never prints secrets and only blocks production.
	- Ensure no server-only env is referenced on the client.

7) Rollout
	- Step 1: land env schema + model catalog (no behavior change yet) and remove client exposure of secrets.
	- Step 2: wire API routes to use the catalog; remove hard-coded models.
	- Step 3: add health endpoint and logging level gates.
	- Step 4: verify in dev, then production.

Env variables (proposed)
- VENICE_API_KEY (required in prod)
- VENICE_CHAT_MODEL (default: default-reasoning)
- VENICE_IMAGE_MODEL_DEFAULT (default: flux-dev)
- VENICE_IMAGE_MODELS (CSV: flux-dev,stable-diffusion-3.5,fluently-xl)
- UPSTASH_REDIS_REST_URL (required in prod if Redis features enabled)
- UPSTASH_REDIS_REST_TOKEN (required in prod if Redis features enabled)
- FEATURE_AI_ENABLED=true|false (default: true)
- FEATURE_IMAGE_GEN_ENABLED=true|false (default: true)
- FEATURE_WARMACHINE_ENABLED=true|false (default: true)
- REQUEST_TIMEOUT_MS (default: 120000)
- LOG_LEVEL=info|debug|warn|error (default: info)
- CORS_ORIGIN (optional; default: *)

Verification checklist
- Local:
  - `validateEnv()` prints warnings only, never fails dev builds.
  - Hitting `/api/health` returns `{ ok: true }` with correct feature flags.
  - Venice chat and image calls succeed with configured models.
  - Redis reads/writes succeed when UPSTASH vars are present; otherwise endpoints return 503 with guidance.
- Prod:
  - Build fails if required env vars are missing.
  - No secrets appear in `window.__NEXT_DATA__` or page source.

Low-risk adjacent improvements
- Remove unused dependencies (e.g., `openai` if not used).
- Add rate-limiting on AI endpoints if exposed publicly (header-based sliding window via Redis).
- Add simple integration tests for the API payload shape (happy path + timeout case).

Notes
- Rotate any keys that were ever committed or shared outside of a secure channel.
- Keep `.env` out of git; commit `.env.example` only.
