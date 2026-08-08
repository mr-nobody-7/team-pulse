import { doubleCsrf } from "csrf-csrf";
import type { Request } from "express";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Slack posts to /slack/commands and /slack/actions with no browser session and
 * no CSRF token. Those requests are authenticated by HMAC signature
 * verification in slack.middleware, so CSRF is neither available nor relevant.
 */
function isWebhookRequest(req: Request): boolean {
  return (req.originalUrl ?? "").startsWith("/slack/");
}

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET!,
  /**
   * Stateless double-submit: the token is bound to the cookie, not to a server
   * session. req.ip cannot be used here because browser traffic reaches this
   * API through the web app's Next.js rewrite, so requests arrive from the
   * frontend host's egress IPs, which rotate between requests and would
   * invalidate every token.
   */
  getSessionIdentifier: () => "",
  /**
   * The __Host- prefix requires Secure, which browsers only honour over HTTPS.
   * Using it in local development would make the cookie silently rejected.
   */
  cookieName: isProduction
    ? "__Host-psifi.x-csrf-token"
    : "psifi.x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "strict",
    secure: isProduction,
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req: Request) =>
    req.headers["x-csrf-token"] as string,
  skipCsrfProtection: isWebhookRequest,
});

export { doubleCsrfProtection, generateCsrfToken };
