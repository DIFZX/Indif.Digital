# Adventure Wedding Pixel release

User authorization: deploy and push the completed theme, connect it to existing RSVP/dashboard services, and publish it in the new Interactive catalog/admin category.

## Preflight

- 34 SQL/security/CMS/theme tests passed, including both attendance states, private dashboard isolation, sales-only category changes, repeatable registration and preservation of other catalog entries.
- TypeScript, targeted ESLint and production build passed.
- General mobile Chromium checks passed: joystick, all panels, RSVP partial/failure handling, bank copy, focus, reduced motion and responsive layouts.
- The new entry check covers the short loading screen, welcome popup, imagegen navbar and arrow navigation in Chromium and WebKit.
- All 23 must-have features are implemented. Photobox is intentionally excluded at the owner's request.
- Brand sweep passed for the shipped theme and assets. Artwork and icons are original; music is CC0 with source evidence. No reference screenshots are included in the release.
- Existing Next.js/Supabase/Vercel deployment is retained. No new payments, OAuth providers, email service, cookies, mobile app, domain or tracking processor is introduced.

## Database and deployment

Only `20261107090000_add_adventure_wedding_pixel` and `20261108090000_add_interactive_catalog_category` are applied, in a coordinated transaction with migration-history records. The linked production dry run passed and rolled back. Historical migrations, unrelated dirty migration changes, existing invitation content and private dashboard tokens are preserved.

The protected dashboard route-group correction is included because production `/sunda-vibes/dashboard/access-required` was confirmed to redirect to itself. It leaves authorization on dashboard content and keeps the access-required screen reachable.

Publish the scoped Git commit to `DIFZX/Indif.Digital`, confirm the matching Vercel deployment is ready, apply the two migrations, and verify the public Interactive category, admin login protection, private dashboard access and one isolated RSVP with cleanup. Deployment identifiers and live verification results are recorded in `scratch/pixel-live-release-report.json`; this file must never contain private dashboard tokens or session cookies.

## Monitor

Use existing Vercel/Supabase logs for rendering or RSVP errors. Confirm the public theme, image/audio requests and category after deployment. Physical Android/iPhone testing remains a hardware check; automated Chromium/WebKit results are browser-engine evidence.
