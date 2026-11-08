import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientDashboard, type DashboardSection } from "@/components/client-dashboard/client-dashboard";

// Each route renders its page inside the shared, protected dashboard shell.
const dashboardSections = new Set<DashboardSection>([
  "bagikan",
  "ucapan",
  "acara",
  "bantuan",
]);

type PageProps = {
  params: Promise<{ slug: string; section: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  const titles: Record<string, string> = { bagikan: "Generator Link Tamu", ucapan: "Ucapan & RSVP", acara: "Rundown & Lokasi", bantuan: "Pusat Bantuan" };
  return { title: `${titles[section] ?? "Dashboard"} | InDif Digital`, robots: { index: false, follow: false } };
}

export default async function CustomerDashboardSectionPage({
  params,
}: PageProps) {
  const { section } = await params;

  if (!dashboardSections.has(section as DashboardSection)) {
    notFound();
  }

  return <ClientDashboard section={section as DashboardSection} />;
}
