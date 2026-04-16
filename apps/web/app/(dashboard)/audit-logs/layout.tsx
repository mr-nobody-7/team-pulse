import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs · Team Pulse",
};

export default function AuditLogsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
