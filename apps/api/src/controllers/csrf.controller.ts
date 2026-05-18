import type { Request, Response } from "express";

// Placeholder: in real use, generate token using the same logic as doubleCsrfProtection
export function csrfTokenController(req: Request, res: Response) {
  // The frontend should get the CSRF token from the cookie set by doubleCsrfProtection
  // Here, just return a dummy value for demonstration
  res.json({ success: true, data: { csrfToken: "dummy-token" } });
}
