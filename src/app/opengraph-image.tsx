import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Imagen que se ve cuando alguien comparte el link por WhatsApp, Instagram o redes.
export const alt = "Aguamarina Estética y Bienestar, Concepción del Uruguay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo-aguamarina-oficial.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
                    background: "linear-gradient(135deg, #EAF6F6 0%, #F6FBFB 60%, #CFE9EC 100%)",
          color: "#0E3B47",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <img src={src} width={900} height={316} alt="" />
          <div style={{ fontSize: 34, color: "#4A6872" }}>Concepción del Uruguay</div>
        </div>
      </div>
    ),
    size
  );
}
