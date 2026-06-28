import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY   = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL       = "Pitchr <noreply@pitchr.org>";
const APP_URL          = "https://pitchr.org";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function generateReferralCode(): string {
  // Unambiguous characters only (no 0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, b => chars[b % chars.length]).join("");
}

function buildWelcomeEmail(firstName: string, position: number, referralCode: string): string {
  const referralUrl = `${APP_URL}?ref=${referralCode}`;
  const positionText = position === 1 ? "the very first person" : `#${position}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>You're on the Pitchr waitlist</title>
<style>
  @media (prefers-color-scheme: dark) {
    body, .wrap   { background:#0a0a0a !important; }
    .card         { border-color:#2a2a2a !important; }
    .body-cell    { background:#141414 !important; }
    .eyebrow      { color:#bbbbbb !important; }
    .heading      { color:#f0f0f0 !important; }
    .sub          { color:#8a8a8a !important; }
    .label        { color:#777777 !important; }
    .box          { background:#1e1e1e !important; border-color:#2a2a2a !important; }
    .pos-label    { color:#777777 !important; }
    .pos-num      { color:#f0f0f0 !important; }
    .ref-title    { color:#f0f0f0 !important; }
    .ref-url      { background:#0a0a0a !important; color:#cccccc !important; border-color:#2a2a2a !important; }
    .btn          { background:#ffffff !important; color:#111111 !important; }
    .item         { color:#cccccc !important; border-color:#2a2a2a !important; }
    .footer-cell  { background:#141414 !important; border-color:#2a2a2a !important; }
    .footer-title { color:#aaaaaa !important; }
    .footer-text  { color:#666666 !important; }
    .footer-link  { color:#f0f0f0 !important; }
  }
</style>
</head>
<body class="wrap" style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;">
<table class="wrap" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:32px 12px;">
<tr><td align="center">
<table class="card" width="100%" cellpadding="0" cellspacing="0" style="max-width:544px;width:100%;border:1px solid rgba(0,0,0,0.12);border-radius:16px;overflow:hidden;">

  <!-- ── BLACK GRADIENT HEADER ── -->
  <tr><td align="center" bgcolor="#000000" style="background:linear-gradient(135deg,#000000 0%,#1a1a1a 55%,#333333 100%);padding:36px 28px 30px;border-radius:16px 16px 0 0;">
    <p style="margin:0 0 8px;font-size:30px;font-weight:bold;letter-spacing:0;color:#ffffff !important;font-family:Arial,Helvetica,sans-serif;">PITCHR</p>
    <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#999999 !important;font-family:Arial,Helvetica,sans-serif;">AI SALES COACH</p>
  </td></tr>

  <!-- ── BODY ── -->
  <tr><td class="body-cell" style="background:#ffffff;padding:24px 20px 0;">

    <p class="eyebrow" style="margin:0 0 7px;font-size:10px;font-weight:700;letter-spacing:2px;color:#111111;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Waitlist confirmed</p>
    <h1 class="heading" style="margin:0 0 10px;font-size:24px;font-weight:800;color:#111111;line-height:1.25;font-family:Arial,Helvetica,sans-serif;">You're in${position <= 100 ? " early" : ""}${firstName ? `, ${firstName}` : ""}.</h1>
    <p class="sub" style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.65;font-family:Arial,Helvetica,sans-serif;">
      You're ${positionText} on the Pitchr waitlist. We're building the AI coach that tells you exactly what to say on every call, in real time, before the prospect hangs up.
    </p>

    <!-- Position -->
    <table class="box" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border:1px solid rgba(0,0,0,0.12);border-radius:10px;margin-bottom:12px;">
      <tr><td style="padding:16px 20px;">
        <p class="pos-label" style="margin:0 0 4px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999999;font-weight:700;font-family:Arial,Helvetica,sans-serif;">Your position</p>
        <p class="pos-num" style="margin:0;font-size:42px;font-weight:900;line-height:1.1;color:#111111;font-family:Arial,Helvetica,sans-serif;">#${position}</p>
      </td></tr>
    </table>

    <!-- Referral -->
    <table class="box" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border:1px solid rgba(0,0,0,0.12);border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p class="ref-title" style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111111;font-family:Arial,Helvetica,sans-serif;">Move up the list →</p>
        <p class="sub" style="margin:0 0 10px;font-size:13px;color:#555555;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">Share your link. Every signup through it bumps you higher.</p>
        <p class="ref-url" style="margin:0 0 12px;background:#efefef;border:1px solid rgba(0,0,0,0.12);border-radius:6px;padding:9px 12px;font-size:11px;color:#333333;font-family:monospace;word-break:break-all;">${referralUrl}</p>
        <a class="btn" href="${referralUrl}" style="display:inline-block;background:linear-gradient(135deg,#111111,#333333);color:#ffffff;text-decoration:none;border-radius:100px;padding:10px 22px;font-size:13px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">Share your link</a>
      </td></tr>
    </table>

    <!-- What's next -->
    <p class="label" style="margin:0 0 10px;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999999;font-family:Arial,Helvetica,sans-serif;">What's next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td class="item" style="padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.08);font-size:13px;color:#444444;font-family:Arial,Helvetica,sans-serif;"><strong>First to know</strong> the moment Pitchr drops</td></tr>
      <tr><td class="item" style="padding:9px 0;border-bottom:1px solid rgba(0,0,0,0.08);font-size:13px;color:#444444;font-family:Arial,Helvetica,sans-serif;">Early <strong>offers and deals</strong> before anyone else sees them</td></tr>
      <tr><td class="item" style="padding:9px 0;font-size:13px;color:#444444;font-family:Arial,Helvetica,sans-serif;">We'll keep you <strong>in the loop</strong> as we build. No spam, ever.</td></tr>
    </table>

  </td></tr>

  <!-- ── FOOTER ── -->
  <tr><td class="footer-cell" style="background:#f7f7f7;padding:18px 20px;text-align:center;border-top:1px solid rgba(0,0,0,0.08);border-radius:0 0 16px 16px;">
    <p class="footer-title" style="margin:0 0 4px;font-size:12px;font-weight:700;color:#999999;font-family:Arial,Helvetica,sans-serif;">Pitchr — AI sales coach</p>
    <p class="footer-text" style="margin:0;font-size:11px;color:#bbbbbb;font-family:Arial,Helvetica,sans-serif;">
      <a class="footer-link" href="${APP_URL}" style="color:#111111;text-decoration:none;">pitchr.org</a> · © 2026 Pitchr. All rights reserved.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  let body: { email?: unknown; name?: unknown; ref?: unknown; source?: unknown };
  try { body = await req.json(); } catch { return respond({ error: "Invalid request body." }, 400); }

  const email  = typeof body.email === "string"  ? body.email.trim().toLowerCase()   : "";
  const name   = typeof body.name  === "string"  ? body.name.trim().slice(0, 100)    : "";
  const ref    = typeof body.ref   === "string"  ? body.ref.trim().toUpperCase().slice(0, 20) : "";
  const source = typeof body.source === "string" ? body.source.slice(0, 50)          : "landing";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond({ error: "Please enter a valid email address." }, 400);
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // Check if email already exists
  const { data: existing } = await db
    .from("waitlist")
    .select("referral_code, created_at")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const { count: refCount } = await db
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", existing.referral_code);
    const { count: pos } = await db
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .lte("created_at", existing.created_at);
    return respond({
      success: true,
      already_joined: true,
      referral_code: existing.referral_code,
      position: pos ?? 1,
      referral_count: refCount ?? 0,
    });
  }

  const referralCode = generateReferralCode();

  const { error: insertError } = await db.from("waitlist").insert({
    email,
    name: name || null,
    referral_code: referralCode,
    referred_by: ref || null,
    source,
  });

  if (insertError) {
    console.error("Insert error:", insertError);
    return respond({ error: "Something went wrong. Please try again." }, 500);
  }

  // Get their position (total count after insert)
  const { count: position } = await db
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  const pos = position ?? 1;

  function guessFirstName(emailAddr: string): string {
    const local = emailAddr.split("@")[0].toLowerCase();
    const segment = local.split(/[._\-+0-9]/)[0];
    return segment.length >= 2
      ? segment.charAt(0).toUpperCase() + segment.slice(1)
      : "";
  }

  const firstName = name.split(" ")[0] || guessFirstName(email);

  // Send welcome email (non-blocking — don't fail signup if email fails)
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `You're #${pos} on the Pitchr waitlist`,
        html: buildWelcomeEmail(firstName, pos, referralCode),
      }),
    }).catch(err => console.error("Resend error:", err));
  }

  return respond({
    success: true,
    referral_code: referralCode,
    position: pos,
    referral_count: 0,
  });
});
