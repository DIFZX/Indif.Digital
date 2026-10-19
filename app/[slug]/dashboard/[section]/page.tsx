import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ClientDashboard,
  type AttendanceFilter,
  type DashboardSection,
} from "@/components/client-dashboard/client-dashboard";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getInvitation,
  getInvitationRSVPs,
  getInvitationViewCount,
} from "@/lib/invitations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const dashboardSections = new Set<DashboardSection>([
  "bagikan",
  "ucapan",
  "acara",
  "bantuan",
]);

const attendanceFilters = new Set<AttendanceFilter>([
  "all",
  "attending",
  "not_attending",
  "unsure",
]);

type PageProps = {
  params: Promise<{ slug: string; section: string }>;
  searchParams: Promise<{ attendance?: string | string[] }>;
};

export default async function CustomerDashboardSectionPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, section } = await params;

  if (!dashboardSections.has(section as DashboardSection)) {
    notFound();
  }

  const { supabase } = await requireAdmin();
  const invitation = await getInvitation(slug);

  if (!invitation) {
    notFound();
  }

  const rawAttendance = (await searchParams).attendance;
  const attendance = Array.isArray(rawAttendance) ? rawAttendance[0] : rawAttendance;
  const initialAttendanceFilter =
    attendance && attendanceFilters.has(attendance as AttendanceFilter)
      ? (attendance as AttendanceFilter)
      : "all";

  const [initialRSVPs, viewCount] = await Promise.all([
    getInvitationRSVPs(invitation.id, supabase),
    getInvitationViewCount(invitation.id, supabase),
  ]);

  return (
    <ClientDashboard
      invitation={invitation}
      initialRSVPs={initialRSVPs}
      viewCount={viewCount}
      activeTab={section as DashboardSection}
      initialAttendanceFilter={initialAttendanceFilter}
    />
  );
}
