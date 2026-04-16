import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings · Team Pulse",
};

export default function SettingsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
