import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const schema = z.object({
  invitationId: z.guid(),
  guestName: z.string().trim().min(2).max(80),
  attendance: z.enum(["attending", "not_attending"]),
  guestCount: z.coerce.number().int().min(1).max(10),
  message: z.string().trim().max(500).optional().default(""),
});

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ message: "Permintaan lintas situs ditolak." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4_096) {
    return NextResponse.json({ message: "Data yang dikirim terlalu besar." }, { status: 413 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ message: "Format data tidak didukung." }, { status: 415 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Data yang dikirim belum valid." }, { status: 400 });

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: "Mode demo aktif. Hubungkan Supabase untuk menyimpan respons." }, { status: 503 });
  }

  const { invitationId, guestName, attendance, guestCount, message } = parsed.data;

  // Check if invitation exists in Supabase invitations table
  const { data: inv } = await supabase
    .from("invitations")
    .select("id")
    .eq("id", invitationId)
    .maybeSingle();

  if (!inv) {
    return NextResponse.json({ message: "Undangan tidak ditemukan atau sudah tidak aktif." }, { status: 404 });
  }

  const { error: rsvpError } = await supabase.from("rsvps").insert({
    invitation_id: invitationId,
    guest_name: guestName,
    attendance,
    guest_count: attendance === "attending" ? guestCount : 0,
  });

  if (rsvpError) return NextResponse.json({ message: "RSVP belum berhasil disimpan." }, { status: 500 });

  let greeting = null;
  if (message) {
    const { data, error: greetingError } = await supabase
      .from("greetings")
      .insert({
        invitation_id: invitationId,
        guest_name: guestName,
        message,
        attendance,
        is_approved: true,
      })
      .select("id, guest_name, message, attendance, created_at")
      .single();
    if (greetingError) return NextResponse.json({ message: "RSVP tersimpan, tetapi ucapan belum berhasil disimpan." }, { status: 207 });
    greeting = data;
  }

  return NextResponse.json({
    message: message
      ? "Terima kasih, respons dan ucapan Anda sudah tersimpan."
      : "Terima kasih, respons Anda sudah tersimpan.",
    greeting,
  }, { status: 201 });
}
