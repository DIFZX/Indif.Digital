# Adventure Wedding Pixel

Preview: `/adventure-wedding-pixel?to=Tamu%20Undangan`. `?preview=1` opens the garden immediately, following the existing preview convention. The normal invitation renderer selects this theme by `invitation.template.slug`, so client invitation slugs remain independent of the template slug.

## Experience

Personalized cover with a character selector; an explorable pixel wedding garden; analogue touch joystick, WASD/arrows, and A/E/Space to open invitation signs; five instantly accessible sections for the couple, events, gallery, RSVP and gifts. The cat sits on the central path; one rabbit and three butterflies react automatically to character contact. The gazebo/cover groom waves, both wedding avatars blink, and forest shadows, golden light and falling leaves add atmosphere. Couple profiles also include the quotation and love story. Photobooth has been removed from the map and interface.

The sample derives its wedding content and photography from Sunda Vibes (Dita and Fajar). Existing Sunda default translations are retained. The map and character art were created for this theme. Reference screenshots in `replica/screens/` are research evidence, not public assets. Recorded voice greetings, guest voice messages, stickers and multiplayer chat are not implemented because they are outside the current invitation backend contract.

## Data and production registration

`supabase/migrations/20261107090000_add_adventure_wedding_pixel.sql` adds the template and copies the existing Sunda Vibes preview into an independent published invitation:

- Template ID: `00000000-0000-0000-0000-000000000010`.
- Preview invitation ID: `00000000-0000-0000-0000-000000000110`.
- Preview slug: `adventure-wedding-pixel`.
- A new private dashboard access record is created through the normal mechanism. No dashboard key is copied from Sunda Vibes.
- Publication is authorized for this release: the new catalog entry starts active and available, with the current Sunda Vibes prices. `20261108090000_add_interactive_catalog_category.sql` adds `interactive` to the database constraint and moves only this template into that category. Sales administrators can then change its visibility, status, prices and category normally.
- Reapplication preserves wedding edits, RSVP rows, existing dashboard links and catalog settings. Conflicting fixed seed IDs raise an exception.

The release applies only the two new migrations after the existing Sunda registration migration, with atomic migration-history records. A production transaction-only dry run passed and was rolled back before publication. Live deployment and RSVP/dashboard verification are recorded in the local release report. Obtain private links through the existing invitation provisioning/admin process; never embed access tokens in client code or public URL lists.

RSVP posts to the existing `/api/guest-response` with `invitationId`, `guestName`, `attendance`, `guestCount`, and `message`. Attending guests retain their count, absent guests become zero on the server. HTTP 207 is shown as a partial save, and network/server errors keep the typed message. No demo success is fabricated when the database is unavailable or the preview has not been registered.

## Validation, updated 2026-11-08

| Check | Result |
| --- | --- |
| Production Next.js build | Passed |
| TypeScript | Passed through production build |
| Targeted ESLint | Passed |
| Existing security/CMS and new theme tests | 34 passed |
| Database registration | Theme and category migrations executed twice in PGlite; content, keys, owner edits and other catalog entries preserved; theme active in Interactive |
| RSVP/dashboard | Actual API handler persisted attending and absent responses to local SQL under the anonymous role; actual dashboard loader/RPC returned matching greetings and counts; wrong token and Sunda token denied |
| Chromium mobile | Cover, choice, movement, real CDP touch drag/release/cancel, A action, keyboard, all five panels passed |
| WebKit touch-enabled context | Cover, pointer joystick, touch-capable controls, keyboard/focus loop, all five panels passed |
| Responsive layout | 320 x 568, 390 x 844, 412 x 915, 768 x 1024, 844 x 390 landscape and 1366 x 900; no horizontal document overflow; form submit reachable |
| Small-phone cover | Start button reachable by normal cover scrolling at 320 x 568; all five menu items fit |
| Error UI | Simulated failed/partial/success browser responses preserve drafts appropriately; production writes were not performed |
| Accessibility | Modal focus loop and restoration, Escape, visible focus, native labels, reduced motion, input zoom-friendly 16px forms |
| Main text contrast | Brown/cream 11.09:1; rose/cream 5.85:1; button text/gold 8.16:1 |
| Performance sample (2026-11-08 cinematic revision) | Headless desktop Chrome at 390 x 844 with 4x CDP CPU slowdown while alternating movement: 170 measured frame intervals, mean 19.61ms (~51fps), p95 16.9ms. Outliers affect the mean; this is a short sample, not a physical-phone benchmark. |

WebKit on Windows upgrades local HTTP asset requests to HTTPS under the app's production CSP directive. The local WebKit harness removed only `upgrade-insecure-requests` from the local HTML response; other CSP directives remained, and production configuration was unchanged. Physical Android and iPhone hardware, real mobile keyboard behavior, and production persistence still need their release checks.

Local QA evidence is in `scratch/pixel-chromium-qa.json`, `scratch/pixel-webkit-qa.json`, `scratch/pixel-final-check.json` and their associated screenshots. Browser smoke script: `scratch/check-pixel.cjs`; SQL regression: `npm.cmd run test:cms`.

## Movement revision, 2026-11-08

Paths and open grass are walkable with a five-pixel foot radius. Polygon water/boundary collisions and individual footprints block buildings, trees, flower beds, lamps, benches and signs. The bridge connects to dry ground, and the visible path around the east side of the gift stall joins the southern entrance. Connectivity tests traverse the garden from spawn to every destination, animal, bridge and entrance; prolonged input cannot cross solid objects.

Both characters use a transparent 24-pose atlas with standing and two walking poses in four directions. Frames advance with actual distance travelled and return to standing on release or obstruction. Reduced motion keeps a standing pose. The garden art now uses a native 384 x 576 grid, hard pixel clusters and nearest-neighbor rendering.

Photobooth was removed from the artwork, navigation, panel, upload/export code and catalog description. Evidence: `scratch/pixel-movement-check.json` and `scratch/pixel-collision-overlay.png`; the blue overlay is a diagnostic artifact and is not shipped in the invitation.

## Garden polish

Each invitation destination has a thin ground ring and an expanding pulse to guide exploration. Milo the cat sits at (384,735) in the central path and purrs with hearts when touched. Mochi the rabbit hops on contact; blue, rose and gold butterflies dance when touched. No animal requires A/E/Space. A contact latch prevents repeats while standing beside an animal and rearms only after leaving a wider boundary. Responses appear briefly in accessible DOM status text. Ambient animation redraws at up to 20fps when standing still. Reduced motion stops pulses, wing/tail/hopping motion, leaves, waving, blinking and walking animation; changing the preference takes effect immediately. Background tabs and open panels pause world animation.

The garden uses deeper forest-green shadows with warm sandstone highlights. A local 6x2 atlas supplies three raised-hand poses and real closed-eye poses for the groom and bride. Canvas canopy shadows, 19 drifting pixel leaves and a soft edge vignette are rendered below the HTML controls. Animal bodies are prerendered into four small cached sprites; tails, hopping and butterfly wings animate separately. The cover avatars share the greeting atlas. No global color filter is applied to text, bank details or wedding photographs.

Bank digits and account holder use normal, high-contrast Arial in a separate cream field. Raw account data and clipboard contents are unchanged. Default music is `Gasmask Love (Loop)` by Kenny Chow, published under CC0 at https://opengameart.org/content/gasmask-love-loop. It replaces inherited Sunda preview music, is stored locally, starts on user gesture, loops at 35% volume and pauses on backgrounding. A separately configured client track still uses the existing media resolver. License evidence is in `public/media/adventure-wedding-pixel/MUSIC-LICENSE.md`.

Current animation/contact QA: `scratch/pixel-cinematic-check.cjs`, with separate Chromium/WebKit reports. Both engines observed the groom's wave and closed-eye frames, the bride's closed-eye frame, automatic contact with all five animals, no repeated reaction while holding contact, re-entry behavior, panel pause and reduced motion. General invitation QA remains in `scratch/check-pixel.cjs`, and prior bank-readability evidence covers 320/390/768 CSS pixels. `scratch/pixel-entry-check.cjs` verifies the short loading transition, welcome card, imagegen navbar, arrows and all five sections at 320/412 CSS pixels and landscape. Browser API simulations are distinguished from local SQL and live production verification in the release reports.

## Entry and catalog release

Starting the adventure shows a blurred garden and loading bar for a minimum 700ms, finishing as soon as the map is ready after that minimum. The overlay is capped at 2.5s so navigation remains usable if a network asset fails. A dismissible welcome card then says “Jelajahi undangan pernikahan kami” and “Datangi ikon untuk membuka info”. The previous “Ikuti lingkaran” message is removed. The navbar uses five original imagegen icons, four visible at once with accessible arrows and native scrolling. Landscape uses a vertical strip.

Interactive is available in the public category tabs, admin sidebar, admin category filter, editor options and validated server action. The database constraint accepts the category without broadening sales permissions. The dashboard content routes use a protected route group, leaving the access-required page outside the authentication guard and fixing its production redirect loop.
