import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClientDashboard } from "@/components/client-dashboard/client-dashboard";
import { requireClientDashboard } from "@/lib/client-dashboard-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard Undangan | InDif Digital",
  description: "Pantau data kehadiran tamu dan ucapan undangan Anda.",
  robots: { index: false, follow: false },
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CustomerDashboardLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const { invitation, initialRSVPs, viewCount } = await requireClientDashboard(slug);

  return (
    <>
      <ClientDashboard
        invitation={invitation}
        initialRSVPs={initialRSVPs}
        viewCount={viewCount}
      />
      {children}
    </>
  );
}
