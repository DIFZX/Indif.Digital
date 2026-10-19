import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getInvitation, getInvitationDashboardData } from "@/lib/invitations";
import { createClient } from "@/lib/supabase/server";

const dashboardTokenPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getDashboardCookieName(slug: string) {
  return `indif-dashboard-${slug}`;
}

export function isDashboardToken(value: string | null | undefined): value is string {
  return Boolean(value && dashboardTokenPattern.test(value));
}

export async function requireClientDashboard(slug: string) {
  const invitation = await getInvitation(slug);
  if (!invitation) notFound();

  const cookieStore = await cookies();
  const dashboardToken = cookieStore.get(getDashboardCookieName(slug))?.value;

  if (!isDashboardToken(dashboardToken)) {
    redirect(`/${slug}/dashboard/access-required`);
  }

  const supabase = await createClient();
  const dashboardData = await getInvitationDashboardData(
    invitation.id,
    dashboardToken,
    supabase,
  );

  if (!dashboardData) {
    redirect(`/${slug}/dashboard/access-required?error=invalid`);
  }

  return {
    invitation,
    ...dashboardData,
  };
}
