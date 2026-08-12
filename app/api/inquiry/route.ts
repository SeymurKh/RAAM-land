import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/* ─── In-memory rate limit: 5 заявок / 10 минут с одного IP ─── */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // защита от разрастания карты
  return false;
}

const TYPE_LABELS: Record<string, string> = {
  book: "Book Artist",
  collab: "Collaboration",
  media: "Media Production",
  coaching: "Coaching",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max).trim() : "";
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Honeypot: реальный пользователь это поле никогда не заполнит.
  // Боту отвечаем "ok", чтобы он не перепробовал другие пути.
  if (clamp(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const type = clamp(body.type, 20);
  const label = TYPE_LABELS[type];
  const email = clamp(body.email, 200);
  const phone = clamp(body.phone, 40);
  const message = clamp(body.message, 5000);
  const artists = Array.isArray(body.artists)
    ? body.artists
        .slice(0, 20)
        .map((a) => clamp(a, 100))
        .filter(Boolean)
    : [];

  if (!label || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const { SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !MAIL_TO) {
    console.error("[inquiry] SMTP_USER / SMTP_PASS / MAIL_TO are not configured");
    return NextResponse.json(
      { error: "Server is not configured" },
      { status: 500 },
    );
  }

  const lines = [
    `Type: ${label}`,
    artists.length > 0 ? `Artists: ${artists.join(", ")}` : null,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    "",
    message || "(no message)",
  ].filter((l): l is string => l !== null);

  try {
    // Порт 587 (STARTTLS): 465 у Hetzner заблокирован для новых аккаунтов
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `RAAM Site <${SMTP_USER}>`,
      to: MAIL_TO,
      replyTo: email,
      subject: `RAAM Inquiry: ${label}`,
      text: lines.join("\n"),
    });

    console.log("[inquiry] Sent:", { type, email, artists: artists.length });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiry] Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
