export type StoryItem = {
  year: string;
  title: string;
  text: string;
};

export type GiftInfo = {
  bank?: string;
  account_number?: string;
  account_name?: string;
};

export type InvitationTemplate = {
  id: string;
  slug: string;
  name: string;
  theme: Record<string, string>;
};

export type Invitation = {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  bride_name: string;
  bride_short_name: string;
  bride_parents: string;
  bride_photo_path: string | null;
  groom_name: string;
  groom_short_name: string;
  groom_parents: string;
  groom_photo_path: string | null;
  event_date: string;
  ceremony_time: string;
  reception_time: string;
  venue_name: string;
  venue_address: string;
  maps_url: string | null;
  opening_text: string;
  quote_text: string;
  quote_source: string;
  story: StoryItem[];
  story_image_path: string | null;
  cover_path: string;
  profile_path: string | null;
  gallery_paths: string[];
  music_path: string | null;
  gift_info: GiftInfo;
  theme_overrides: Record<string, string>;
  closing_text: string;
  closing_greeting: string;
  template: InvitationTemplate;
};

export type Greeting = {
  id: string;
  guest_name: string;
  message: string;
  attendance: "attending" | "not_attending" | "unsure" | null;
  created_at: string;
};

export type GuestRSVP = {
  id: string;
  invitation_id?: string;
  guest_name: string;
  attendance: "attending" | "not_attending" | "unsure";
  guest_count: number;
  message?: string;
  created_at: string;
};

