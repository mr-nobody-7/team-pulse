# TeamFore Security Audit Report
Date: 2026-05-18
Scope: apps/api and apps/web
Mode: Audit only, no remediation changes

## 1) Backend entrypoint and middleware stack
Current state
- Main backend bootstrap is in [apps/api/src/server.ts](apps/api/src/server.ts#L1) and app wiring is in [apps/api/src/app.ts](apps/api/src/app.ts#L1).
- Middleware registration order in [apps/api/src/app.ts](apps/api/src/app.ts):
  1. trust proxy: [apps/api/src/app.ts](apps/api/src/app.ts#L65)
  2. cors: [apps/api/src/app.ts](apps/api/src/app.ts#L67)
  3. helmet: [apps/api/src/app.ts](apps/api/src/app.ts#L87)
  4. compression: [apps/api/src/app.ts](apps/api/src/app.ts#L88)
  5. global API rate limit: [apps/api/src/app.ts](apps/api/src/app.ts#L89)
  6. express.json with 1mb limit: [apps/api/src/app.ts](apps/api/src/app.ts#L90)
  7. express.urlencoded (no explicit limit): [apps/api/src/app.ts](apps/api/src/app.ts#L100)
  8. cookieParser: [apps/api/src/app.ts](apps/api/src/app.ts#L110)
  9. passport.initialize: [apps/api/src/app.ts](apps/api/src/app.ts#L111)
  10. route mounts auth through push: [apps/api/src/app.ts](apps/api/src/app.ts#L113)
  11. sentry express error handler: [apps/api/src/app.ts](apps/api/src/app.ts#L142)
  12. custom error handler: [apps/api/src/app.ts](apps/api/src/app.ts#L143)
- Helmet is enabled with default options only: [apps/api/src/app.ts](apps/api/src/app.ts#L87).
- CORS is dynamic allowlist based on CLIENT_URL and CLIENT_URLS, credentials enabled: [apps/api/src/app.ts](apps/api/src/app.ts#L68), [apps/api/src/app.ts](apps/api/src/app.ts#L84).
- CORS methods are not explicitly constrained, so cors defaults apply.
- Rate limiting uses express-rate-limit with:
  - API limiter 300 per 15 min: [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts#L4), [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts#L6)
  - Auth limiter 20 per 15 min: [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts#L16), [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts#L18)
- Compression is enabled: [apps/api/src/app.ts](apps/api/src/app.ts#L88).
- Body parser limits:
  - JSON: explicit 1mb: [apps/api/src/app.ts](apps/api/src/app.ts#L92)
  - URL encoded: no explicit limit configured: [apps/api/src/app.ts](apps/api/src/app.ts#L101)

Risk level
- MEDIUM

Key issues
- URL encoded parser has no explicit request size policy in code, unlike JSON parser.
- CORS allows credentialed cross-origin traffic but there is no CSRF protection middleware in stack.

References
- [apps/api/src/app.ts](apps/api/src/app.ts#L67)
- [apps/api/src/app.ts](apps/api/src/app.ts#L84)
- [apps/api/src/app.ts](apps/api/src/app.ts#L92)
- [apps/api/src/app.ts](apps/api/src/app.ts#L101)

## 2) Backend middleware directory review
Current state
- Middleware files found:
  - [apps/api/src/middleware/authenticate.ts](apps/api/src/middleware/authenticate.ts)
  - [apps/api/src/middleware/authorize.ts](apps/api/src/middleware/authorize.ts)
  - [apps/api/src/middleware/validate.ts](apps/api/src/middleware/validate.ts)
  - [apps/api/src/middleware/errorHandler.ts](apps/api/src/middleware/errorHandler.ts)
  - [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts)
  - [apps/api/src/middleware/plan.middleware.ts](apps/api/src/middleware/plan.middleware.ts)

Per middleware
- authenticate:
  - Validates req.cookies.token and verifies JWT via verifyToken.
  - On missing token: Unauthorized.
  - On invalid token: Unauthorized with Invalid token.
  - [apps/api/src/middleware/authenticate.ts](apps/api/src/middleware/authenticate.ts#L9)
- authorize:
  - Checks req.user exists and role in allowedRoles.
  - [apps/api/src/middleware/authorize.ts](apps/api/src/middleware/authorize.ts#L4)
- validate:
  - Uses Zod schema.safeParse against req.body.
  - Returns first issue message on failure.
  - [apps/api/src/middleware/validate.ts](apps/api/src/middleware/validate.ts#L5)
- errorHandler:
  - Handles AppError with explicit status and message.
  - Handles known DB connectivity codes with generic 503.
  - Unhandled errors return generic Internal server error; stack not sent to client.
  - [apps/api/src/middleware/errorHandler.ts](apps/api/src/middleware/errorHandler.ts#L21)
- security:
  - Defines apiRateLimit and authRateLimit.
  - [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts#L4)
- plan.middleware:
  - Enforces plan levels with cached workspace plan lookup.
  - [apps/api/src/middleware/plan.middleware.ts](apps/api/src/middleware/plan.middleware.ts#L24)

Route protection coverage summary
- authenticate is applied broadly across protected route groups.
- role checks via authorize are present on many admin or manager operations.
- validation via Zod middleware is present for many write endpoints.

Risk level
- LOW

Key issue
- authenticate returns distinct Invalid token text versus missing token default unauthorized, which can aid minor token state probing.

References
- [apps/api/src/middleware/authenticate.ts](apps/api/src/middleware/authenticate.ts#L19)

## 3) Backend lib and utils security primitives
Current state
- Encryption utility exists in [apps/api/src/utils/encryption.ts](apps/api/src/utils/encryption.ts).
- Algorithm is aes-256-cbc: [apps/api/src/utils/encryption.ts](apps/api/src/utils/encryption.ts#L3).
- JWT helper in [apps/api/src/utils/jwt.ts](apps/api/src/utils/jwt.ts):
  - Secret required at startup: [apps/api/src/utils/jwt.ts](apps/api/src/utils/jwt.ts#L6)
  - Sign with expiresIn 7d: [apps/api/src/utils/jwt.ts](apps/api/src/utils/jwt.ts#L11)
  - Verify with jsonwebtoken defaults: [apps/api/src/utils/jwt.ts](apps/api/src/utils/jwt.ts#L15)
- DB access via Prisma client adapter in [apps/api/src/lib/db.ts](apps/api/src/lib/db.ts#L5).

Risk level
- HIGH

Key issues
- Encryption mode aes-256-cbc is not authenticated encryption (no integrity check tag), making ciphertext malleability risks higher than AEAD modes.
- API Sentry init has hardcoded DSN fallback literal string if env absent.

References
- [apps/api/src/utils/encryption.ts](apps/api/src/utils/encryption.ts#L3)
- [apps/api/src/instrument.ts](apps/api/src/instrument.ts#L5)

## 4) Prisma schema data protection review
Current state
- Passwords are stored as hashes in User.passwordHash: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L144).
- Slack OAuth token storage uses encrypted field accessTokenEncrypted: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L118).
- Google tokens are stored in plaintext fields accessToken and refreshToken in UserGoogleToken model: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L295), [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L296).
- PII present in multiple models:
  - Email: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L143)
  - IP in audit logs: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L200)
  - Freeform metadata JSON that can include email context: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L201)
  - Feedback message text: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L279)

Risk level
- HIGH

Key issue
- Google OAuth access and refresh tokens are persisted unencrypted in database.

References
- [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L295)
- [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L296)

## 5) apps/api/.env.example review
Current state
Environment variables listed in [apps/api/.env.example](apps/api/.env.example):
- DATABASE_URL
- NODE_ENV
- PORT
- JWT_SECRET
- CLIENT_URL
- SENTRY_DSN
- SENTRY_AUTH_TOKEN (commented example)
- CLIENT_URLS (commented example)
- PUBLIC_API_URL (commented example)
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL
- BREVO_API_KEY
- BREVO_SENDER_EMAIL
- BREVO_SENDER_NAME
- TEAM_MIN_CAPACITY_WARNING_PERCENT
- SLACK_CLIENT_ID
- SLACK_CLIENT_SECRET
- SLACK_SIGNING_SECRET
- SLACK_REDIRECT_URI
- ENCRYPTION_KEY
- GOOGLE_CALENDAR_ENABLED
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_CONTACT_EMAIL

Variables with notable hardcoded fallback behavior in source
- SENTRY_DSN has hardcoded fallback literal in runtime init: [apps/api/src/instrument.ts](apps/api/src/instrument.ts#L5)
- BREVO sender email and name fall back to hardcoded strings in mail service: [apps/api/src/services/mail.service.ts](apps/api/src/services/mail.service.ts#L10)
- BREVO reply-to fallback in mail service: [apps/api/src/services/mail.service.ts](apps/api/src/services/mail.service.ts#L15)
- GOOGLE_CALLBACK_URL falls back to relative callback path: [apps/api/src/auth/strategies/google.strategy.ts](apps/api/src/auth/strategies/google.strategy.ts#L24)

Risk level
- MEDIUM

## 6) Route security coverage across apps/api/src/routes
Current state
Routes with no authenticate middleware
- Auth/public OAuth routes and auth entry points:
  - register: [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L36)
  - register-workspace: [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L37)
  - login: [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L42)
  - google start/callback/failure: [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L43), [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L54), [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L62)
  - logout: [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L70)
- Push public key endpoint:
  - [apps/api/src/routes/push.routes.ts](apps/api/src/routes/push.routes.ts#L12)
- Slack OAuth callback and signed Slack interaction endpoints do not use authenticate but use signature verification on commands/actions:
  - oauth callback: [apps/api/src/integrations/slack/slack.router.ts](apps/api/src/integrations/slack/slack.router.ts#L52)
  - commands: [apps/api/src/integrations/slack/slack.router.ts](apps/api/src/integrations/slack/slack.router.ts#L147)
  - actions: [apps/api/src/integrations/slack/slack.router.ts](apps/api/src/integrations/slack/slack.router.ts#L151)

Routes with authenticate but no explicit role check
- teams list: [apps/api/src/routes/team.routes.ts](apps/api/src/routes/team.routes.ts#L15)
- leave list and cancel: [apps/api/src/routes/leave.routes.ts](apps/api/src/routes/leave.routes.ts#L27), [apps/api/src/routes/leave.routes.ts](apps/api/src/routes/leave.routes.ts#L44)
- availability board and update: [apps/api/src/routes/availability.routes.ts](apps/api/src/routes/availability.routes.ts#L13)
- feedback create: [apps/api/src/routes/feedback.routes.ts](apps/api/src/routes/feedback.routes.ts#L9)
- holidays list: [apps/api/src/routes/holiday.routes.ts](apps/api/src/routes/holiday.routes.ts#L8)
- reports summary: [apps/api/src/routes/reports.routes.ts](apps/api/src/routes/reports.routes.ts#L12)
- settings leave-types read and leave-balances read: [apps/api/src/routes/settings.routes.ts](apps/api/src/routes/settings.routes.ts#L29), [apps/api/src/routes/settings.routes.ts](apps/api/src/routes/settings.routes.ts#L70)
- auth me and calendar status/disconnect are authenticated but not role-gated: [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L63), [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L69)

File upload routes
- No multer, busboy, formidable, or multipart handlers found in apps/api/src.

Dynamic raw query risk
- No raw SQL query usage found in handwritten API source under apps/api/src except generated Prisma client internals.

Risk level
- HIGH

Key issues
- logout endpoint is unauthenticated and state-changing, while auth model is cookie-based.
- Public register and login are expected, but CSRF protections are not visible in middleware stack for cookie auth flows.

References
- [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L70)
- [apps/api/src/app.ts](apps/api/src/app.ts#L67)

## 7) Controllers and services security behavior
Current state
- No eval or child_process exec usage in handwritten backend source.
- No raw SQL query API usage in handwritten backend source (Prisma ORM query builders used).
- Password verification uses bcrypt.compare: [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L219).
- Login error behavior:
  - user missing returns InvalidCredentialsError: [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L212)
  - wrong password returns InvalidCredentialsError: [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L222)
  - inactive account returns Account is inactive with ForbiddenError: [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L216)
- Error handler response to unhandled exceptions is generic Internal server error (no stack leak): [apps/api/src/middleware/errorHandler.ts](apps/api/src/middleware/errorHandler.ts#L42)

Risk level
- MEDIUM

Key issue
- Login flow reveals account status for valid user records via distinct inactive-account response, enabling partial user enumeration.

Reference
- [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L216)

## 8) Frontend next.config.ts security headers and env exposure
Current state
- next config currently defines rewrites and sentry wrapper only: [apps/web/next.config.ts](apps/web/next.config.ts#L17), [apps/web/next.config.ts](apps/web/next.config.ts#L27).
- No headers() block and no explicit CSP/security headers in Next config.
- Uses process.env.BACKEND_URL server-side for rewrite destination: [apps/web/next.config.ts](apps/web/next.config.ts#L13).
- Sentry build auth token is referenced server-side only in config: [apps/web/next.config.ts](apps/web/next.config.ts#L35).

Risk level
- HIGH

Key issue
- No explicit frontend security headers policy at Next.js edge/config level, including no CSP.

Reference
- [apps/web/next.config.ts](apps/web/next.config.ts#L17)

## 9) Frontend app and src security patterns
Current state
- No dangerouslySetInnerHTML usage found in apps/web handwritten source.
- Client redirects are present but mostly static app routes:
  - [apps/web/app/(auth)/login/page.tsx](apps/web/app/(auth)/login/page.tsx#L47)
  - [apps/web/app/(auth)/register/page.tsx](apps/web/app/(auth)/register/page.tsx#L136)
- A client redirect target is constructed from NEXT_PUBLIC_API_URL in Google calendar connect card:
  - [apps/web/src/components/settings/google-calendar-connect.tsx](apps/web/src/components/settings/google-calendar-connect.tsx#L16)
  - [apps/web/src/components/settings/google-calendar-connect.tsx](apps/web/src/components/settings/google-calendar-connect.tsx#L47)
- Local storage usage exists for PWA install prompt dismissal only, not auth tokens: [apps/web/components/pwa/install-prompt.tsx](apps/web/components/pwa/install-prompt.tsx#L20).
- API client uses withCredentials and baseURL /api, consistent with cookie-based auth: [apps/web/lib/axios.ts](apps/web/lib/axios.ts#L6).

Risk level
- MEDIUM

Key issues
- Legacy NEXT_PUBLIC_API_URL usage can alter OAuth redirect base from a public env var in client code path.
- Sensitive Sentry auth token is present in local file apps/web/.env.sentry-build-plugin; file is ignored but token exists on disk.

References
- [apps/web/src/components/settings/google-calendar-connect.tsx](apps/web/src/components/settings/google-calendar-connect.tsx#L16)
- [apps/web/.gitignore](apps/web/.gitignore#L40)
- [apps/web/.env.sentry-build-plugin](apps/web/.env.sentry-build-plugin#L5)

## 10) JWT cookie configuration review
Current state
- Cookie set in auth controller issueAuthCookie with:
  - httpOnly true: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L19)
  - secure based on production: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L20)
  - sameSite strict in non-prod and none in prod: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L21)
  - maxAge 7 days: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L54)
- Cookie cleared on logout with same options: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L267)
- Refresh token mechanism is not implemented. Only a single token cookie is used.

Risk level
- MEDIUM

Key issues
- No refresh token rotation model.
- sameSite none in production increases CSRF exposure if cross-site contexts are allowed and no CSRF middleware is present.

References
- [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L21)
- [apps/api/src/app.ts](apps/api/src/app.ts#L67)

---

## Risk-grouped findings

### CRITICAL (fix before any user data is stored)
1. Plaintext Google OAuth tokens in database.
- Stored in UserGoogleToken.accessToken and refreshToken fields.
- References: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L295), [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L296)

### HIGH (fix before public launch)
1. Missing explicit frontend security headers and CSP policy in Next config.
- Reference: [apps/web/next.config.ts](apps/web/next.config.ts#L17)
2. Cookie-auth state-changing flows without visible CSRF protection middleware.
- Relevant stack and routes: [apps/api/src/app.ts](apps/api/src/app.ts#L67), [apps/api/src/routes/auth.routes.ts](apps/api/src/routes/auth.routes.ts#L70)
3. Hardcoded Sentry DSN fallback in API instrumentation.
- Reference: [apps/api/src/instrument.ts](apps/api/src/instrument.ts#L5)
4. Encryption mode uses AES-CBC without authenticated encryption.
- Reference: [apps/api/src/utils/encryption.ts](apps/api/src/utils/encryption.ts#L3)

### MEDIUM (fix within 30 days of launch)
1. URL encoded body parser has no explicit request limit while JSON parser is constrained.
- Reference: [apps/api/src/app.ts](apps/api/src/app.ts#L101)
2. Login returns distinct inactive-account message, enabling partial account state disclosure.
- Reference: [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L216)
3. No refresh token mechanism; single long-lived auth cookie only.
- Reference: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L54)
4. Client-side OAuth redirect base can be influenced by NEXT_PUBLIC_API_URL public env.
- Reference: [apps/web/src/components/settings/google-calendar-connect.tsx](apps/web/src/components/settings/google-calendar-connect.tsx#L16)
5. Local Sentry auth token file present on disk (ignored, but sensitive material exists locally).
- References: [apps/web/.gitignore](apps/web/.gitignore#L40), [apps/web/.env.sentry-build-plugin](apps/web/.env.sentry-build-plugin#L5)

### LOW (nice to have)
1. authenticate middleware differentiates missing versus invalid token text.
- Reference: [apps/api/src/middleware/authenticate.ts](apps/api/src/middleware/authenticate.ts#L19)
2. CORS methods are implicit defaults, not explicitly constrained in configuration.
- Reference: [apps/api/src/app.ts](apps/api/src/app.ts#L68)

### OK (implemented well)
1. Passwords are hashed with bcrypt and verified with bcrypt.compare.
- References: [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma#L144), [apps/api/src/services/auth.service.ts](apps/api/src/services/auth.service.ts#L219)
2. Error handler avoids stack trace leakage to clients.
- Reference: [apps/api/src/middleware/errorHandler.ts](apps/api/src/middleware/errorHandler.ts#L42)
3. Rate limiting is implemented globally and for auth endpoints.
- Reference: [apps/api/src/middleware/security.ts](apps/api/src/middleware/security.ts#L4)
4. HttpOnly auth cookie is enabled with secure and sameSite controls.
- Reference: [apps/api/src/controllers/auth.controller.ts](apps/api/src/controllers/auth.controller.ts#L19)
5. No dangerouslySetInnerHTML found in frontend code.
- Evidence sweep across apps/web produced no matches.

---

## Audit caveats
- This report is static code review from repository contents and local workspace files.
- Runtime environment configuration in hosting platforms was not directly inspected.
- Secret exposure severity assumes repository and CI practices; local ignored files are still operationally sensitive.