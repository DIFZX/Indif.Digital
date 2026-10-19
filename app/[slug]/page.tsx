import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation-view";
import { InvitationViewTracker } from "@/components/invitation-view-tracker";
import { getGreetings, getInvitation } from "@/lib/invitations";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string | string[]; preview?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) return { title: "Undangan tidak ditemukan" };

  return {
    title: `${invitation.bride_short_name} & ${invitation.groom_short_name}`,
    description: invitation.opening_text,
  };
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const invitation = await getInvitation(slug);
  if (!invitation) notFound();

  const greetings = await getGreetings(invitation.id);
  const rawGuestName = Array.isArray(query.to) ? query.to[0] : query.to;
  const guestName = rawGuestName?.trim().slice(0, 80) || null;
  const preview = (Array.isArray(query.preview) ? query.preview[0] : query.preview) === "1";
  return (
    <>
      {!preview && <InvitationViewTracker invitationId={invitation.id} />}
      <InvitationView invitation={invitation} greetings={greetings} guestName={guestName} initiallyOpened={preview} />
    </>
  );
}
