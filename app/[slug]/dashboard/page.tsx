import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientDashboard } from "@/components/client-dashboard/client-dashboard";
import { requireAdmin } from "@/lib/admin-auth";
import { getInvitation, getInvitationRSVPs, getInvitationViewCount } from "@/lib/invitations";

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
  const { supabase } = await requireAdmin();
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) {
    notFound();
  }

  const [initialRSVPs, viewCount] = await Promise.all([
    getInvitationRSVPs(invitation.id, supabase),
    getInvitationViewCount(invitation.id, supabase),
  ]);

  return (
    <ClientDashboard
      invitation={invitation}
      initialRSVPs={initialRSVPs}
      viewCount={viewCount}
      activeTab="dashboard"
    />
  );
}
