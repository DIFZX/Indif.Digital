import type { Metadata } from "next";
import { ClientDashboard } from "@/components/client-dashboard/client-dashboard";
import { requireClientDashboard } from "@/lib/client-dashboard-access";
import { getInvitation } from "@/lib/invitations";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) return { title: "Dashboard Tidak Ditemukan" };

  return {
    title: `Dashboard RSVP | ${invitation.bride_short_name} & ${invitation.groom_short_name}`,
    description: `Pantau data kehadiran tamu dan ucapan doa pernikahan ${invitation.bride_short_name} & ${invitation.groom_short_name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CustomerDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const { invitation, initialRSVPs, viewCount } = await requireClientDashboard(slug);

  return (
    <ClientDashboard
      invitation={invitation}
      initialRSVPs={initialRSVPs}
      viewCount={viewCount}
      activeTab="dashboard"
    />
  );
}
