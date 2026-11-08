import type { Invitation } from "@/lib/types";

export const MAX_SHARE_MESSAGE_LENGTH = 6000;

export const SHARE_MESSAGE_FIELDS = [
  { token: "{nama_tamu}", label: "Nama tamu" },
  { token: "{nama_mempelai}", label: "Nama mempelai" },
  { token: "{nama_panggilan}", label: "Nama panggilan" },
  { token: "{tanggal}", label: "Tanggal" },
  { token: "{lokasi}", label: "Lokasi" },
  { token: "{link_undangan}", label: "Link undangan" },
] as const;

export const DEFAULT_SHARE_MESSAGE = `Kepada Yth.
*{nama_tamu}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia pernikahan kami:

*{nama_mempelai}*
{tanggal}
{lokasi}

Informasi lengkap serta reservasi kehadiran dapat diakses melalui link undangan berikut:
{link_undangan}

Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih.

Salam hangat,
*{nama_panggilan}*`;

type ShareInvitation = Pick<Invitation, "bride_name" | "groom_name" | "bride_short_name" | "groom_short_name" | "event_date" | "venue_name">;

export function renderGuestShareMessage(
  template: string,
  invitation: ShareInvitation,
  guestName: string,
  personalizedUrl: string,
) {
  if (!template.trim()) return "";
  const values: Record<string, string> = {
    nama_tamu: guestName.trim() || "[Nama Tamu]",
    nama_mempelai: `${invitation.bride_name} & ${invitation.groom_name}`,
    nama_panggilan: `${invitation.bride_short_name} & ${invitation.groom_short_name}`,
    tanggal: new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date(`${invitation.event_date}T12:00:00+07:00`)),
    lokasi: invitation.venue_name,
    link_undangan: personalizedUrl,
  };
  // Replace only the original markers, so a guest's name cannot introduce another field.
  const message = template.replace(/\{(nama_tamu|nama_mempelai|nama_panggilan|tanggal|lokasi|link_undangan)\}/g, (_, field: string) => values[field]);
  return message.includes(personalizedUrl) ? message : `${message.trimEnd()}\n\n${personalizedUrl}`;
}
