import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `Plainspoken — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Link-preview card for LinkedIn, iMessage, Slack, etc.
 * Same palette as globals.css: desk, legal pad, ink, editor's red pen.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9e6dc",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 1040,
            height: 470,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#fbf3d5",
            border: "2px solid #eadfb4",
            borderLeft: "12px solid #d98b80",
            padding: "56px 64px",
            backgroundImage:
              "repeating-linear-gradient(transparent 0px, transparent 46px, #a8c2d8 46px, #a8c2d8 47px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 96, fontWeight: 600, color: "#191d2b", letterSpacing: -2 }}>
                Plainspoken
              </span>
              <span style={{ fontSize: 96, fontWeight: 600, color: "#c8402b" }}>.</span>
            </div>
            <span style={{ marginTop: 12, fontSize: 44, color: "#4d5468" }}>
              {SITE.tagline}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span style={{ fontSize: 28, color: "#4d5468", maxWidth: 700, lineHeight: 1.3 }}>
              Type what you want in your own words. Get a prompt that works, and
              see why.
            </span>
            <span style={{ fontSize: 28, color: "#c8402b", fontFamily: "monospace" }}>
              plainspoken.site
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
