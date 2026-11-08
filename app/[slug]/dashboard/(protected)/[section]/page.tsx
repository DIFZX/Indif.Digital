import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { DashboardSection } from "@/components/client-dashboard/client-dashboard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// These sections share the protected dashboard layout without changing URLs.
const dashboardSections = new Set<DashboardSection>([
  "bagikan",
  "ucapan",
  "acara",
  "bantuan",
]);

type PageProps = {
  params: Promise<{ slug: string; section: string }>;
};

export default async function CustomerDashboardSectionPage({
  params,
}: PageProps) {
  const { section } = await params;

  if (!dashboardSections.has(section as DashboardSection)) {
    notFound();
  }

  return null;
}
