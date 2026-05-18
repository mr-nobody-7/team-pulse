import { NextResponse } from "next/server";

/**
 * Server-side redirect to backend OAuth endpoint
 * Prevents exposing backend URL to browser/client-side code
 * Backend URL comes from private environment variable, not public
 */
export async function GET() {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(`${backendUrl}/auth/google/calendar-connect`);
}
