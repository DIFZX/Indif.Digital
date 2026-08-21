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
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Data yang dikirim belum valid." }, { status: 400 });

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: "Mode demo aktif. Hubungkan Supabase untuk menyimpan respons." }, { status: 503 });
  }

  const { invitationId, guestName, attendance, guestCount, message } = parsed.data;
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
