import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export async function createBrandIcon(size: number) {
  const logo = await readFile(join(process.cwd(), "public/media/brand/indif-digital-logo-v1.png"));
  const scale = size / 640;

  return new ImageResponse(
    <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#fff7ed", borderRadius: size * 0.2 }}>
      {/* Keep the original logo intact; show its monogram within the square icon. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a native image for server-side rendering. */}
      <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={2048 * scale} height={768 * scale} style={{ position: "absolute", left: 16 * scale, top: -45 * scale }} />
    </div>,
    { width: size, height: size },
  );
}
