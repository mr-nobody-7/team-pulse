import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata: Metadata = {
  title: "Privacy Policy — TeamFore",
  description: "How TeamFore collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-linear-to-b from-[#14111d] via-[#0f0c17] to-[#0a0813] text-white min-h-screen">
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-28">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-400">Last updated: May 19, 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              1. Who we are
            </h2>
            <p>
              TeamFore (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a
              workspace-based leave and availability management platform built
              for teams. This Privacy Policy explains how we collect, use, and
              protect your information when you use our service at{" "}
              <span className="font-medium text-white">
                teamfore.vercel.app
              </span>
              .
            </p>
          </section>

          {/* ── Google User Data (required by Google API Services User Data Policy) ── */}
          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              2. Google User Data
            </h2>
            <p className="mb-4">
              TeamFore uses Google APIs for two purposes: authentication (Google
              Sign-In) and optional Google Calendar integration. The following
              discloses how we handle Google user data in compliance with the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-white underline underline-offset-2 hover:text-zinc-300"
              >
                Google API Services User Data Policy
              </a>
              .
            </p>

            <div className="space-y-6 pl-1">
              {/* a — Data Accessed */}
              <div>
                <h3 className="mb-2 font-semibold text-white">
                  a) Data Accessed
                </h3>
                <p className="mb-2">
                  <span className="font-medium text-white">
                    Google Sign-In (all users):
                  </span>{" "}
                  When you authenticate with Google we receive your name, email
                  address, and Google account ID. We do not receive your Google
                  password or access to any other Google service.
                </p>
                <p>
                  <span className="font-medium text-white">
                    Google Calendar (optional — only after explicit consent):
                  </span>{" "}
                  If you connect your Google Calendar we request the{" "}
                  <code className="rounded bg-white/10 px-1 text-xs">
                    https://www.googleapis.com/auth/calendar
                  </code>{" "}
                  scope to read and write calendar events so we can sync your
                  approved leave requests. We do not access any other Google
                  service or scope.
                </p>
              </div>

              {/* b — Data Usage */}
              <div>
                <h3 className="mb-2 font-semibold text-white">b) Data Usage</h3>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-medium text-white">
                      Name &amp; email:
                    </span>{" "}
                    used to create and identify your TeamFore account and to
                    send leave-related email notifications.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      Google account ID:
                    </span>{" "}
                    used solely to link your Google identity to your TeamFore
                    account during sign-in. It is never exposed to other users.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      Google Calendar OAuth tokens:
                    </span>{" "}
                    used only to create, update, and delete leave events on{" "}
                    <em>your own</em> Google Calendar. We never read calendar
                    content for any purpose beyond leave synchronisation.
                  </li>
                </ul>
                <p className="mt-3 font-medium text-white">
                  We do not use Google user data to serve advertisements, build
                  user profiles, or train AI or ML models. Google user data is
                  not transferred to third parties for purposes unrelated to
                  providing TeamFore.
                </p>
              </div>

              {/* c — Data Sharing */}
              <div>
                <h3 className="mb-2 font-semibold text-white">
                  c) Data Sharing
                </h3>
                <p>
                  Google user data is{" "}
                  <span className="font-medium text-white">
                    never sold or shared with third parties
                  </span>{" "}
                  except as strictly necessary to operate the service:
                </p>
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-medium text-white">
                      Neon (PostgreSQL):
                    </span>{" "}
                    your encrypted account data and tokens are stored in their
                    managed database. Neon does not process Google data
                    independently.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      Brevo (email):
                    </span>{" "}
                    your name and email address are passed to Brevo only to
                    deliver transactional leave notifications. Brevo does not
                    receive Google OAuth tokens or calendar data.
                  </li>
                </ul>
                <p className="mt-3">
                  No Google user data is shared with analytics providers,
                  advertisers, or any other third party beyond those listed
                  above.
                </p>
              </div>

              {/* d — Data Storage & Protection */}
              <div>
                <h3 className="mb-2 font-semibold text-white">
                  d) Data Storage &amp; Protection
                </h3>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    Google OAuth access and refresh tokens are{" "}
                    <span className="font-medium text-white">
                      encrypted at rest using AES-256-GCM
                    </span>{" "}
                    before being written to our database. The encryption key is
                    stored separately and never alongside the ciphertext.
                  </li>
                  <li>
                    All data is transmitted over{" "}
                    <span className="font-medium text-white">
                      HTTPS / TLS 1.2+
                    </span>
                    . Strict-Transport-Security (HSTS) headers are enforced in
                    production.
                  </li>
                  <li>
                    Database access is restricted to our backend application
                    server. No direct public access is permitted.
                  </li>
                  <li>
                    Sessions use short-lived access tokens (15 minutes) and
                    rotating refresh tokens stored as httpOnly cookies to
                    minimise the impact of token leakage.
                  </li>
                </ul>
              </div>

              {/* e — Data Retention & Deletion */}
              <div>
                <h3 className="mb-2 font-semibold text-white">
                  e) Data Retention &amp; Deletion
                </h3>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-medium text-white">
                      Google Sign-In data (name, email, Google account ID):
                    </span>{" "}
                    retained for the lifetime of your account. Permanently
                    deleted when your account is removed.
                  </li>
                  <li>
                    <span className="font-medium text-white">
                      Google Calendar OAuth tokens:
                    </span>{" "}
                    deleted immediately when you disconnect Google Calendar from
                    your TeamFore settings, or when your account is deleted,
                    whichever comes first.
                  </li>
                  <li>
                    To delete your account and all associated Google data,
                    contact us at{" "}
                    <a
                      href="mailto:support@teamfore.com"
                      className="text-white underline underline-offset-2 hover:text-zinc-300"
                    >
                      support@teamfore.com
                    </a>
                    . You can also revoke calendar access at any time via{" "}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noreferrer"
                      className="text-white underline underline-offset-2 hover:text-zinc-300"
                    >
                      myaccount.google.com/permissions
                    </a>
                    .
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              3. Information we collect
            </h2>
            <p className="mb-3">
              We collect only the information necessary to provide the service:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-white">
                  Account information:
                </span>{" "}
                your name and email address, provided directly or via Google
                OAuth sign-in.
              </li>
              <li>
                <span className="font-medium text-white">
                  Google OAuth data:
                </span>{" "}
                when you sign in with Google, we receive your name, email
                address, and Google account ID. We do not receive your Google
                password or access to your Google account beyond authentication.
              </li>
              <li>
                <span className="font-medium text-white">Usage data:</span>{" "}
                leave requests, availability status, workload status, and other
                actions you take within the app.
              </li>
              <li>
                <span className="font-medium text-white">Workspace data:</span>{" "}
                team names, user roles, leave type configurations, and related
                settings created by your workspace admin.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              4. How we use your information
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To authenticate you and manage your session securely.</li>
              <li>
                To provide leave management, team calendar, and availability
                features.
              </li>
              <li>
                To send email notifications related to your leave requests and
                approvals (via Brevo).
              </li>
              <li>
                To generate analytics and reports scoped to your workspace.
              </li>
              <li>
                To maintain audit logs of key actions for governance and
                compliance within your workspace.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data. We do not use your data for
              advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              5. Data sharing
            </h2>
            <p className="mb-3">
              We share your data only with the following third-party services
              required to operate the platform:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-white">
                  Neon (PostgreSQL):
                </span>{" "}
                our database provider. Your data is stored in their managed
                PostgreSQL service.
              </li>
              <li>
                <span className="font-medium text-white">
                  Brevo (Sendinblue):
                </span>{" "}
                used to send transactional emails (leave notifications). We
                share only your email address and name for this purpose.
              </li>
              <li>
                <span className="font-medium text-white">Google OAuth:</span>{" "}
                used for authentication. We receive basic profile data (name,
                email) from Google only when you choose to sign in with Google.
              </li>
              <li>
                <span className="font-medium text-white">PostHog:</span> used
                for product analytics. We may share anonymized usage events. No
                personally identifiable information is sent to PostHog.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              6. Cookies and sessions
            </h2>
            <p>
              We use a single{" "}
              <span className="font-medium text-white">
                httpOnly, secure cookie
              </span>{" "}
              to maintain your authenticated session. This cookie is strictly
              necessary for the service to function. We do not use tracking
              cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              7. Data retention
            </h2>
            <p>
              Your data is retained for as long as your account and workspace
              exist. When a workspace is deleted, associated user records and
              leave data are removed. Audit logs are retained for compliance
              purposes. You may request deletion of your account by contacting
              us at the email below.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              8. Your rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>
                Request correction of inaccurate data (you can update your
                profile directly in the app).
              </li>
              <li>Request deletion of your account and associated data.</li>
              <li>
                Withdraw consent for Google OAuth by revoking access via your
                Google account settings at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline underline-offset-2 hover:text-zinc-300"
                >
                  myaccount.google.com/permissions
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              9. Security
            </h2>
            <p>
              We use industry-standard security practices: encrypted connections
              (HTTPS/TLS), httpOnly session cookies, Helmet security headers,
              rate limiting, and workspace-level data isolation. No system is
              completely secure; if you believe your account has been
              compromised, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              10. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be noted by updating the date at the top of this
              page. Continued use of TeamFore after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">
              11. Contact
            </h2>
            <p>
              For any privacy-related questions or data requests, contact us at:{" "}
              <a
                href="mailto:vivekanandagodi@gmail.com"
                className="text-white underline underline-offset-2 hover:text-zinc-300"
              >
                vivekanandagodi@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
