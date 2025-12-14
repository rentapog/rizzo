# RentAPog - AI Coding Agent Instructions

## Project Overview
RentAPog is a daily domain rental marketplace with a unique affiliate commission structure. Users rent subdomains for $20-$399/day and earn 100% commission on all sales except their 2nd sale (which passes up to admin for platform sustainability). The system features automated subdomain creation via Cloudflare, multi-tier packages, trial periods, daily billing, and real-time notifications.

## Architecture

### Technology Stack
- **Frontend**: React 19 + Wouter (routing) + Tailwind + shadcn/ui (Radix) + Framer Motion
- **Backend**: Express.js + TypeScript (using `tsx` runtime)
- **Database**: PostgreSQL + Drizzle ORM (schema in `shared/schema.ts`)
- **Build**: Vite (client), esbuild (server) - production bundle via `script/build.ts`
- **Deployment**: Cloudflare Pages (configured in `wrangler.toml`)
- **External APIs**: Stripe (payments), Cloudflare (DNS/subdomains), Anthropic Claude (AI), SendGrid/Resend (email)

### Monorepo Structure
```
client/          - React SPA (Vite dev server on :5000)
server/          - Express backend (runs on main port)
shared/          - Shared types & Drizzle schema
script/build.ts  - Production build orchestration
```

**Path aliases** (see `vite.config.ts`):
- `@/` → `client/src/`
- `@shared` → `shared/`
- `@assets` → `attached_assets/`

### Data Access Pattern
**All database operations go through `server/storage.ts`** - never query `db` directly. The storage layer provides typed methods like `storage.getUserByEmail()`, `storage.createAffiliateSale()`, etc. This abstraction handles complex queries, transactions, and business logic.

Example:
```typescript
// ❌ Don't do this:
const user = await db.select().from(users).where(eq(users.email, email));

// ✅ Do this:
const user = await storage.getUserByEmail(email);
```

## Critical Business Logic

### Pass-Up Commission System
The core revenue model - understanding this is essential for any payment/sales changes:

1. **Tier-based tracking**: Each package tier ($20, $49, $99, etc.) tracks sales independently via `userTierSales` table
2. **2nd sale rule**: At each tier, user's 2nd sale passes to admin (unless user is sub-admin via `isSubAdmin` flag)
3. **Under-leveling**: If buyer's package > seller's package, sale passes to admin (seller can't earn commission on higher tiers they haven't purchased)
4. **Sub-admins**: Can be created by main admin; keep their own 2nd sales (like a franchise model)

**Implementation locations**:
- Sale creation: `server/routes.ts` around line 750 (search for "Pass-up logic")
- Schema: `shared/schema.ts` - `affiliateSales.passedUpTo`, `userTierSales.saleNumber`
- Frontend display: `client/src/pages/UserBackend.tsx` (sales dashboard)

### Trial & Billing System
1. **Trial period**: 7 days after paying join fee (tracked via `trialStartedAt`, `trialEndsAt`)
2. **Trial end conditions**: Time expires OR user gets 2 qualified referrals
3. **Daily billing**: After trial, `billingWorker.ts` charges `dailyChargeAmount` (based on package tier)
4. **Balance priority**: Uses `referralBalance` first (from commissions), then `accountBalance`
5. **Auto-cancellation**: If balance insufficient, account cancelled (`isActive = false`, login blocked)

**Worker locations**:
- `server/billingWorker.ts` - runs every 5 minutes checking trials/charges
- `server/emailWorker.ts` - sends scheduled emails every 10 seconds
- Both start in `server/index.ts`

### Subdomain Routing
The hostname-based routing in `server/index.ts` (lines 60-100) handles:
- `subdomain.rentapog.com` → redirect to `rentapog.com/?aff={user.referralCode}` (if user found)
- `backend.rentapog.com` → Backoffice dashboard (admin + users)
- `backoffice576.rentapog.com` → Admin-only backoffice
- `packages.rentapog.com` → Package tier purchase pages
- System subdomains (family, family1-7, sales, domain) → pass through to normal routing

Frontend router in `client/src/App.tsx` checks `window.location.hostname` to show appropriate page tree.

## Development Workflows

### Running Locally
```bash
npm run dev          # Starts Express + Vite HMR (backend:main port, client:5000)
npm run build        # Production build (client→dist/public, server→dist/index.cjs)
npm run db:push      # Push Drizzle schema changes to DB
npm run check        # TypeScript type checking
```

**Environment setup**: Requires `.env` with:
- `DATABASE_URL` (Neon Postgres)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` (for subdomain DNS)
- `RESEND_API_KEY` or `SENDGRID_API_KEY` (email)
- `ADMIN_PIN` (admin auth)
- `SESSION_SECRET` (Express sessions)

### Database Schema Changes
1. Edit `shared/schema.ts` (uses Drizzle ORM)
2. Run `npm run db:push` to apply changes
3. Update `server/storage.ts` methods if new queries needed
4. Add TypeScript types exported from schema (e.g., `export type User = typeof users.$inferSelect`)

### Adding New Routes
Backend routes split across files:
- `server/routes.ts` - Main API routes (6000+ lines, handles auth, payments, sales, domains)
- `server/routes-team-deployment.ts` - Team management
- `server/routes-website-builder.ts` - Static website creation (Cloudflare Pages deployment)
- `server/routes-user-sites.ts` - User-created site management

All registered via `registerRoutes()` in `server/index.ts`.

### Cloudflare Integration
- **Subdomain creation**: `server/cloudflare.ts` - `createSubdomain()` adds CNAME records
- **Domain forwarding**: Uses Cloudflare Page Rules API (see `setupDomainForwarding()`)
- **Website deployment**: `server/cloudflare-pages.ts` - deploys to Pages via API

## Common Patterns

### Authentication
- **Users**: Email/password with `bcryptjs`, sessions via `express-session` + cookie
- **Admin**: PIN-based auth (`ADMIN_PIN` env var), sessions stored in `adminSessions` table
- **Sub-admin**: Additional `subAdminPin` field on user records
- Check auth: `req.session?.userId` or `storage.getAdminSession(adminToken)`

### Stripe Webhooks
Payment events handled in `server/routes.ts` (search for `/webhook/stripe`):
- `checkout.session.completed` → Creates user account, triggers trial
- `charge.succeeded` → Credits account balance
- `charge.failed` → Triggers auto-cancellation logic
- Must verify signature: `stripe.webhooks.constructEvent()`

### Email Flow
1. Create scheduled emails: `storage.createEmailSchedule({ emailNumber: 1, userId, sendAt })`
2. Worker (`emailWorker.ts`) picks up pending emails
3. Sends via Resend/SendGrid based on env vars
4. Marks as sent: `storage.markEmailAsSent(id)`

### Real-time Notifications
WebSocket server in `server/websocket.ts` broadcasts events:
```typescript
notificationService.broadcast({
  type: "domain_listing",
  title: "New Domain Listed!",
  message: `${domainName} available for $${price}/day`,
  timestamp: new Date().toISOString()
});
```
Frontend connects via `NotificationBell.tsx` component.

## Key Conventions

### Branding Multi-tenancy
The system supports multiple brands (RentAPog, Airizzos) via env vars:
- `SITE_NAME`, `SITE_EMAIL`, `SITE_DOMAIN` control branding
- Helper: `getSiteBranding()` in `server/routes.ts`
- Used in emails, UI text, domain references

### Error Handling
Express routes use try-catch with consistent response structure:
```typescript
try {
  const result = await storage.someOperation();
  return res.json({ success: true, data: result });
} catch (error) {
  return res.status(500).json({ success: false, error: String(error) });
}
```

### Frontend Data Fetching
Uses TanStack Query (`@tanstack/react-query`) with centralized client in `lib/queryClient.ts`. API calls typically use native `fetch()` with error handling.

## Testing Strategy
- No automated test suite currently
- Manual testing via admin dashboard at `backend.rentapog.com`
- Stripe test mode for payment flows
- Check server logs for worker activity (billing, email sending)

## Deployment Notes
- Cloudflare Pages reads `wrangler.toml` for build config
- Production build creates `dist/public/` (Vite) + `dist/index.cjs` (server bundle)
- Environment variables set in Cloudflare dashboard (never in wrangler.toml)
- Workers (billing, email) run in-process with Express server (not Cloudflare Workers)

## When Making Changes

**Before modifying payments/sales**: Review pass-up logic in `server/routes.ts` and tier sales tracking - incorrect changes can break commission accounting.

**Before schema changes**: Ensure existing data migrations are considered - production DB has active users.

**Before adding dependencies**: Check `script/build.ts` allowlist - some packages must be bundled to reduce cold start syscalls.

**When debugging subdomain issues**: Check hostname routing middleware in `server/index.ts` (lines 60-100) and Cloudflare DNS records via `getAllDnsRecords()`.

## References
- Pass-up system explanation: `replit.md` (lines 7, 22-24)
- Affiliate setup: `NAMECHEAP_AFFILIATE_SETUP.md`
- Full tech details: `replit.md` (comprehensive project documentation)
