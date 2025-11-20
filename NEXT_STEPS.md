# PRIMEX Build & Deployment: Next Actions

This repo snapshot does not record an active deployment. Use this checklist (ordered by dependency) to move the PRIMEX MVP from
local readiness to a hosted launch and keep a clear owner/status for each step.

## 0) Assign accountability
- [ ] Name a DRI for launch (who will own checkboxes below) and a backup reviewer for each stage.
- [ ] Capture target environments (staging/prod) and their URLs in `README` or your team runbook.

## 1) Finalize configuration
- [ ] Copy `.env.example` to `.env` and fill in Clerk, database, OpenAI/Anthropic/Groq, and Stripe keys (if billing enabled).
- [ ] Align `DATABASE_URL` with your managed Postgres (Supabase/Neon); add pooling if your provider requires it.
- [ ] Confirm `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` exist in every target environment.
- [ ] Pre-create `.env.production` (or Vercel dashboard entries) so CI/CD does not block on missing secrets.

## 2) Database readiness
- [ ] Run `npx prisma generate` locally to refresh the client after schema edits.
- [ ] Run `npx prisma migrate dev` locally, then `npx prisma migrate deploy` in staging/prod against the managed database.
- [ ] Prepare seed/test data (optional) so QA can validate chats without real customer traffic.

## 3) Quality gates before deploy
- [ ] `npm run lint` — confirm no TypeScript/ESLint blockers.
- [ ] `npm run build` — verify the Next.js build is production-ready and Prisma generates during the build.
- [ ] `npm run dev` — smoke-test auth, chat, and model switching using the configured providers.

## 4) Deploy to Vercel (recommended)
- [ ] Create/link a Vercel project for this repo and set the default branch for production.
- [ ] Populate all environment variables in Vercel (`DATABASE_URL`, Clerk keys, model API keys, Stripe keys if enabled).
- [ ] Trigger a deploy that runs `npm run build`; verify the Prisma client is generated in the build logs.
- [ ] After first deploy, run `npx prisma migrate deploy` against production if Vercel did not run it automatically.

## 5) Post-deploy validation
- [ ] Verify Clerk auth flows (sign-up, sign-in, session renewal) and protected routes in production.
- [ ] Send a test chat across each enabled model provider; confirm responses land in the database.
- [ ] Confirm analytics/monitoring hooks (Vercel Analytics, Sentry if configured) receive events.
- [ ] Set up uptime and error alerts for critical endpoints; add on-call escalation.
- [ ] Document a quick rollback path (e.g., revert to previous Vercel build, or hotfix migration rollback).

## 6) Upcoming PRIMEX work (Phase 3 roadmap)
- [ ] Define PRIMEX command schemas and authorization layer.
- [ ] Add Sovereign control UI/feature flags with per-environment toggles.
- [ ] Write operational runbooks for PRIMEX-specific actions and attach to the repo.

Track progress here so you can quickly answer "what's next" and keep launch ownership visible.
