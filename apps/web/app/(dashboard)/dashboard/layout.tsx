import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · Team Pulse",
};

export default function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
