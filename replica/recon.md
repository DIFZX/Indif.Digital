# Adventure Wedding Pixel: browser invitation

Scope: mobile-first invitation theme with an explorable pixel wedding garden, analogue movement, action button and instant access to every invitation section. For InDif Digital clients. Date: 2026-11-07.

## Sources

| Source | URL | Evidence |
| --- | --- | --- |
| Public interactive preview | https://inveet.id/theme-preview/adventure-of-us-interactive | Cover, character selector, welcome, tutorial, world and six panels visited in Chromium at 390 x 844. |
| Existing content and contracts | ../lib/demo.ts | Sunda Vibes wedding fields and media, Dita and Fajar. |
| Existing RSVP endpoint | ../app/api/guest-response/route.ts | POST fields, attendance, guest counts, partial-save handling. |
| Existing private dashboard | ../lib/invitations.ts | Token-protected dashboard RPC and invitation ID isolation. |

Reference screenshots are in screens/ and are review evidence only. No reference JavaScript, private API, art, voice recordings or guest messages are included in the theme.

## Core loop

Guest chooses a character, opens the garden, walks to a sign and presses A to read wedding details; quick navigation also opens each section directly. Guest submits RSVP and a greeting to the existing invitation API.

## Screens

| ID | Screen | Entry | Purpose | Components | Observed states |
| --- | --- | --- | --- | --- | --- |
| S01 | Invitation cover | Public URL | Names, date, named guest, character choice | Garden, wooden heading, cream card, two characters, start button | Mobile, male selected |
| S02 | Welcome | Start | Personal introduction | Voice greeting, text, skip | Playing, skip |
| S03 | Help | First world visit | Explain movement and quick navigation | Instruction dialog | Open, dismissed |
| S04 | Garden | After help | Explore destinations | Camera, character, joystick, A button, music, quick nav | Idle, loading, touch controls |
| S05 | Couple | Sign/menu | Couple profiles and quotation | Portraits, names, parent details, modal | Populated text, some reference photos blank |
| S06 | Events | Sign/menu | Dates, times and venues | Event cards, Maps links | Populated |
| S07 | Gallery | Sign/menu | Wedding photos | Gallery, video action | Reference album appears empty |
| S08 | RSVP | Sign/menu | Attendance and wishes | Name, message, attendance, stickers, voice, greetings | Existing greetings; no submission to reference |
| S09 | Gifts | Sign/menu | Bank details | Account number, copy action | Populated |
| S10 | Photobox | Sign/menu | Photo souvenir | Reference photobox loading | Loading only; camera flow unverified |

## Flows

- F01 Enter: S01 character selection -> start -> S02 skip -> S03 dismiss -> S04. Three clicks after selection in reference.
- F02 Explore: S04 joystick/WASD/arrows -> nearby sign -> A -> section -> close. Quick menu offers the same destination without movement.
- F03 Wedding details: S04 -> S05/S06 -> Maps/calendar. Calendar is an existing-project addition.
- F04 RSVP: S04 -> S08 -> name, attendance, guest count, message -> POST -> confirmation. Errors and partial saves must retain text.
- F05 Photos: S04 -> S07 -> photo -> next/previous -> close.
- F06 Gifts: S04 -> S09 -> copy bank account -> confirmation.
- F07 Souvenir: S04 -> S10 -> choose own photo -> locally render frame -> download. Implemented without camera permission or uploads.

## Components

Wooden sign, parchment dialog, pixel icon, character selector, walking character, analogue pad, action button, music toggle, quick menu, event card, profile, timeline, gallery/lightbox, RSVP form, greetings, gift card, photo-frame exporter. All dialogs need focus containment, Escape/back dismissal and scrollable content. Controls need >=44px hit targets.

## Data model

Use existing Invitation -> InvitationTemplate, Invitation -> RSVP[], Invitation -> Greeting[], Invitation -> private dashboard access. Evidence is current project code, confidence high. Theme adds no remote user model. Position, selected character and visited locations are ephemeral browser state; photo editing stays local. New preview gets a distinct invitation ID, never Sunda Vibes' RSVP rows or dashboard key.

## Design and engineering

Warm green garden, cream parchment, dark wood outlines and rose accent follow the supplied reference. Pixelify Sans is self-hosted for headings; system sans keeps forms readable at 16px. ENERGY 3, RHYTHM 3, MOTION 3: motion is character input and contextual feedback. Fixed daylight palette follows the illustrated world. Art is an original generated garden; code-native character sprites and icons support the game mechanics. The map is one compressed image, drawn once to a cached canvas; animation redraws only while active. Pause on hidden document, block input behind dialogs, reset on pointer cancellation and window blur. Respect reduced motion and safe areas. Quick navigation makes all wedding data reachable without playing.

## Out of scope / unverified

Reference live guest chat, voice greetings, recorded guest messages, stickers, third-party photobox service and proprietary assets are not part of the existing invitation data contract. No fabricated recordings or fake multiplayer. Photo souvenir uses a local uploaded photo. Real Android/iOS device performance must be distinguished from Chromium/WebKit emulation. Catalog publication and production deployment are separate from local implementation.

## Size

10 screens, 7 flows, 5 existing entities. Size M for reusable production theme. Hardest parts: responsive touch movement/camera, invitation-isolated RSVP/dashboard persistence, and mobile dialog/photo interactions. Recon proceeds directly to implementation because the user already specified the platform, slice, business and existing backend.
