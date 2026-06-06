import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY   = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL       = "Pitchr <noreply@pitchr.org>";
const APP_URL          = "https://pitchr.org";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
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
<title>You're on the Pitchr waitlist</title>
<style>
  /* Light mode defaults */
  body { background:#f4f4f5 !important; }
  .email-body { background:#f4f4f5 !important; }
  .card { background:#ffffff !important; color:#111111 !important; }
  .card-label { color:#814ac8 !important; }
  .card-heading { color:#111111 !important; }
  .card-sub { color:#555555 !important; }
  .divider { border-color:#e5e5e5 !important; }
  .pos-box { background:#f8f5ff !important; border-color:#d8c4f5 !important; }
  .pos-label { color:#888888 !important; }
  .ref-box { background:#f8f5ff !important; border-color:#d8c4f5 !important; }
  .ref-url { background:#ede9f7 !important; color:#814ac8 !important; border-color:#d8c4f5 !important; }
  .next-label { color:#888888 !important; }
  .next-item { color:#444444 !important; border-color:#e5e5e5 !important; }
  .footer-text { color:#999999 !important; }
  .footer-link { color:#814ac8 !important; }
  .logo-text { color:#814ac8 !important; }

  /* Dark mode overrides */
  @media (prefers-color-scheme: dark) {
    body { background:#0a0a0a !important; }
    .email-body { background:#0a0a0a !important; }
    .card { background:#111111 !important; color:#ffffff !important; }
    .card-heading { color:#ffffff !important; }
    .card-sub { color:#999999 !important; }
    .divider { border-color:#222222 !important; }
    .pos-box { background:#1a1025 !important; border-color:#3a1d6e !important; }
    .pos-label { color:#666666 !important; }
    .ref-box { background:#1a1025 !important; border-color:#3a1d6e !important; }
    .ref-url { background:#0d0a14 !important; color:#df7afe !important; border-color:#2a1a3e !important; }
    .next-label { color:#555555 !important; }
    .next-item { color:#aaaaaa !important; border-color:#1a1a1a !important; }
    .footer-text { color:#444444 !important; }
    .footer-link { color:#814ac8 !important; }
  }
</style>
</head>
<body class="email-body" style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table class="email-body" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding-bottom:24px;">
    <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#814ac8,#df7afe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#814ac8;">Pitchr</span>
  </td></tr>

  <!-- Main card — rectangle with glowing purple border -->
  <tr><td class="card" style="background:#ffffff;border:2px solid #814ac8;border-radius:12px;padding:40px 36px;box-shadow:0 0 24px rgba(129,74,200,0.35),0 0 48px rgba(129,74,200,0.15);">

    <p class="card-label" style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;color:#814ac8;text-transform:uppercase;">Waitlist confirmed</p>
    <h1 class="card-heading" style="margin:0 0 14px;font-size:28px;font-weight:800;color:#111111;line-height:1.2;">You're in${position <= 100 ? ", early" : ""}, ${firstName}.</h1>
    <p class="card-sub" style="margin:0 0 32px;font-size:15px;color:#555555;line-height:1.6;">
      You're ${positionText} on the Pitchr waitlist. We're building the AI coach that tells you exactly what to say on every call — in real time, before the prospect hangs up.
    </p>

    <!-- Position -->
    <table class="pos-box" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1px solid #d8c4f5;border-radius:10px;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p class="pos-label" style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#888888;font-weight:600;">Your position</p>
        <p style="margin:0;font-size:44px;font-weight:900;color:#814ac8;line-height:1;">#${position}</p>
      </td></tr>
    </table>

    <!-- Referral -->
    <table class="ref-box" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ff;border:1px solid #d8c4f5;border-radius:10px;margin-bottom:32px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#814ac8;">Move up the list →</p>
        <p class="card-sub" style="margin:0 0 14px;font-size:13px;color:#555555;line-height:1.5;">Share your link. Every signup through it bumps you higher.</p>
        <p class="ref-url" style="margin:0 0 14px;background:#ede9f7;border:1px solid #d8c4f5;border-radius:6px;padding:10px 12px;font-size:12px;color:#814ac8;font-family:monospace;word-break:break-all;">${referralUrl}</p>
        <a href="${referralUrl}" style="display:inline-block;background:linear-gradient(135deg,#814ac8,#df7afe);color:#ffffff;text-decoration:none;border-radius:100px;padding:11px 22px;font-size:13px;font-weight:700;">Share your link</a>
      </td></tr>
    </table>

    <!-- What's next -->
    <p class="next-label" style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#888888;">What happens next</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td class="next-item" style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#444444;">
        <span style="color:#814ac8;font-weight:700;">→</span>&nbsp;&nbsp;App preview sent before anyone else
      </td></tr>
      <tr><td class="next-item" style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#444444;">
        <span style="color:#814ac8;font-weight:700;">→</span>&nbsp;&nbsp;Early access 2 weeks before public launch
      </td></tr>
      <tr><td class="next-item" style="padding:10px 0;font-size:14px;color:#444444;">
        <span style="color:#814ac8;font-weight:700;">→</span>&nbsp;&nbsp;Founding member discount locked in for life
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 0 0;text-align:center;">
    <p class="footer-text" style="margin:0;font-size:12px;color:#999999;">You signed up at <a class="footer-link" href="${APP_URL}" style="color:#814ac8;text-decoration:none;">pitchr.org</a> · © 2026 Pitchr</p>
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
  const firstName = name.split(" ")[0] || "there";

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
