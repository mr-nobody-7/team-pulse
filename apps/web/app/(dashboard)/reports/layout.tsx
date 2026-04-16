import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports · Team Pulse",
};

export default function ReportsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
