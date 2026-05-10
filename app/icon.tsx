import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          backgroundColor: "#080706",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#f5f0e8",
            letterSpacing: "0.06em",
          }}
        >
          R
        </span>
      </div>
    ),
    { ...size }
  );
}
