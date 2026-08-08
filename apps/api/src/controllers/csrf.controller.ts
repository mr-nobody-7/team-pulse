import type { Request, Response } from "express";
import { generateCsrfToken } from "../middleware/csrf.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Issues a CSRF token and sets the matching cookie.
 *
 * This must stay unauthenticated: login and register are themselves
 * state-changing requests that the CSRF middleware protects, so a client needs
 * a token before it can authenticate.
 */
export function csrfTokenController(req: Request, res: Response) {
  const csrfToken = generateCsrfToken(req, res, { overwrite: true });
  return sendSuccess(res, { csrfToken }, "CSRF token issued");
}
