import { NextResponse, type NextRequest } from "next/server";
import {
  getDashboardCookieName,
  isDashboardToken,
} from "@/lib/client-dashboard-access";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const dashboardToken = request.nextUrl.searchParams.get("key");
  const invalidUrl = new URL(`/${slug}/dashboard/access-required?error=invalid`, request.url);

  if (!isDashboardToken(dashboardToken)) {
    return NextResponse.redirect(invalidUrl);
  }

  const supabase = await createClient();
  const { data: isValid, error } = await supabase.rpc(
    "verify_invitation_dashboard_access",
    {
      target_slug: slug,
      dashboard_token: dashboardToken,
    },
  );

  if (error || isValid !== true) {
    return NextResponse.redirect(invalidUrl);
  }

  const response = NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(getDashboardCookieName(slug), dashboardToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: `/${slug}/dashboard`,
    maxAge: 60 * 60 * 24 * 180,
  });

  return response;
}
