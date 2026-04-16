import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Calendar · Team Pulse",
};

export default function CalendarSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
