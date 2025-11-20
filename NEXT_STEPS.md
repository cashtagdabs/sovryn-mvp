# PRIMEX Build & Deployment: Next Actions

This repository snapshot does not record an active deployment. Use this checklist to move the PRIMEX MVP from local readiness to a hosted launch.

## 1) Finalize configuration
- [ ] Copy `.env.example` to `.env` and fill in Clerk, database, OpenAI/Anthropic/Groq, and Stripe keys where applicable.
- [ ] Align `DATABASE_URL` with your managed Postgres (Supabase/Neon). Add pooling if your provider requires it.
- [ ] Confirm `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are provisioned in the target environment.

## 2) Database readiness
- [ ] Run `npx prisma generate` to refresh the client after any schema edits.
- [ ] Run `npx prisma migrate dev` locally, then `npx prisma migrate deploy` in staging/production.
- [ ] Prepare seed/test data if you need demo conversations for QA.

## 3) Quality gates before deploy
- [ ] `npm run lint` — ensure no TypeScript/ESLint blockers.
- [ ] `npm run build` — verify the Next.js build is production-ready.
- [ ] Smoke-test chat, auth, and model switching in `npm run dev` against your configured providers.

## 4) Deploy to Vercel (recommended)
- [ ] Create a new Vercel project and link this repo.
- [ ] Populate all environment variables in Vercel (including `DATABASE_URL`, Clerk keys, model API keys, Stripe keys if enabled).
- [ ] Trigger `npm run build` during the Vercel deployment; ensure Prisma client is generated as part of the build.
- [ ] After first deploy, run `npx prisma migrate deploy` against the production database if not automatically executed.

## 5) Post-deploy validation
- [ ] Verify Clerk auth flows and protected routes in production.
- [ ] Send a test chat across each enabled model provider.
- [ ] Confirm analytics/monitoring hooks (Vercel Analytics, Sentry if configured).
- [ ] Set up uptime and error alerts for critical endpoints.

## 6) Upcoming PRIMEX work (Phase 3 roadmap)
- [ ] Define the PRIMEX command schemas and authorization layer.
- [ ] Add Sovereign control UI/feature flags so it can be toggled per environment.
- [ ] Document operational runbooks for PRIMEX-specific actions.

Track progress here so you can quickly answer "what's next" and ensure nothing blocks the launch.
