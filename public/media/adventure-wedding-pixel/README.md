# Adventure Wedding Pixel assets

- `garden.webp`: original wedding garden, with forest-green shadows and golden afternoon light, stored at native 384 x 576 (482,982 bytes, lossless). Rendered with nearest-neighbor scaling in the 768 x 1152 world. Photobooth replaced with a rose garden.
- `greeting.webp`: original transparent 6 x 2 greeting atlas, 384 x 128 (39,314 bytes). Top row groom: neutral, three raised-hand wave poses, raised-hand blink, neutral blink. Bottom row bride: four open-eye poses and two blink poses. Used for the cover and gazebo couple.
- `walking.webp`: transparent 6-column by 4-row walking atlas, 768 x 512 (162,946 bytes). Columns: groom idle/left step/right step, then bride idle/left step/right step. Rows: front/left/right/back. Animation follows actual distance travelled and stops at obstacles.
- `characters.webp`: original transparent sprite sheet, 2 columns by 4 rows, 512 x 768 (87,030 bytes). Columns: male/female. Rows: front/left/right/back.
- `thumbnail.webp`: screenshot of this implementation for the template catalog.
- `nav-couple.webp`, `nav-events.webp`, `nav-gallery.webp`, `nav-rsvp.webp`, `nav-gift.webp`: original imagegen pixel inventory icons, prepared as transparent 80 x 80 WebP files. Used for the scrollable navbar, welcome card and short loading transition.
- `gasmask-love.mp3`: romantic chiptune loop by Kenny Chow, CC0. Source and license: `MUSIC-LICENSE.md`.
- `fonts/pixelify-sans.ttf`: Pixelify Sans variable font from https://github.com/google/fonts/tree/main/ofl/pixelifysans, licensed under the SIL Open Font License in `fonts/OFL.txt`.

The garden and character sheets were generated for this project on 2026-11-07 and revised on 2026-11-08. The cat, rabbit and three butterflies are original code-drawn pixel sprites in `wildlife.ts`. Canopy shadows and falling leaves are code-native effects in `cinematic.ts`. No artwork or screenshots from the reference site are shipped in this folder. Wedding photography and data inherit Sunda Vibes; music is this theme's local licensed loop.
