import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const VIEWER_COOKIE = "indif_visitor";
const ONE_YEAR = 60 * 60 * 24 * 365;
const schema = z.object({ invitationId: z.guid() });
const botPattern = /bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegram/i;

export async function POST(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return new NextResponse(null, { status: 403 });

  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || botPattern.test(userAgent)) return new NextResponse(null, { status: 204 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 512) return new NextResponse(null, { status: 413 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const cookieHeader = request.headers.get("cookie") ?? "";
  const existingViewerId = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VIEWER_COOKIE}=`))
    ?.slice(VIEWER_COOKIE.length + 1);
  const parsedViewerId = z.guid().safeParse(existingViewerId);
  const viewerId = parsedViewerId.success ? parsedViewerId.data : randomUUID();

  const supabase = getSupabase();
  if (supabase) {
    await supabase.rpc("record_invitation_view", {
      target_invitation_id: parsed.data.invitationId,
      target_visitor_id: viewerId,
    });
  }

  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set(VIEWER_COOKIE, viewerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return response;
}
