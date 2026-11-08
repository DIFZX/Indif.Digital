import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClientDashboardShell } from "@/components/client-dashboard/client-dashboard-shell";
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
  // Only dashboard content uses this layout. The access-required page must
  // remain outside it so guests without a cookie do not redirect to themselves.
  const { slug } = await params;
  const { invitation, initialRSVPs, viewCount, shareMessageTemplate } = await requireClientDashboard(slug);

  return (
    <ClientDashboardShell
      invitation={invitation}
      initialRSVPs={initialRSVPs}
      viewCount={viewCount}
      shareMessageTemplate={shareMessageTemplate}
    >
      {children}
    </ClientDashboardShell>
  );
}
