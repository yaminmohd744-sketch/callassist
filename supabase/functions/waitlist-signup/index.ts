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

function positionSvg(pos: number): string {
  return `<p style="margin:0;font-size:42px;font-weight:700;line-height:1.1;font-family:'Clash Display',-apple-system,BlinkMacSystemFont,Arial,sans-serif;background:linear-gradient(135deg,#814ac8,#df7afe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#814ac8;">#${pos}</p>`;
}

const PITCHR_SVG = `<img src="${APP_URL}/pitchr-email-logo.png" alt="PITCHR" width="140" height="30" style="display:block;border:0;outline:none;" />`;

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
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');
  /* === Default: LIGHT === */
  body, .wrap { background:#ede8f5 !important; }
  .card {
    background:#ffffff !important;
    border:2px solid #814ac8 !important;
    border-radius:14px !important;
    box-shadow:0 0 0 1px rgba(129,74,200,0.25),0 0 18px rgba(129,74,200,0.18),0 0 36px rgba(129,74,200,0.09) !important;
  }
  .logo-row {
    border-color:rgba(129,74,200,0.22) !important;
    background:linear-gradient(180deg,rgba(129,74,200,0.07) 0%,rgba(129,74,200,0) 100%) !important;
  }
  .heading { color:#111111 !important; }
  .sub { color:#555555 !important; }
  .label { color:#888888 !important; }
  .pos-box { background:#f3effe !important; border-color:#c9b0ee !important; }
  .pos-label { color:#9b8aaa !important; }
  .ref-box { background:#f3effe !important; border-color:#c9b0ee !important; }
  .ref-title { color:#814ac8 !important; }
  .ref-url { background:#ede6fa !important; color:#6b3db0 !important; border-color:#c9b0ee !important; }
  .item { color:#444444 !important; border-color:#e8dff5 !important; }
  .footer { color:#aaaaaa !important; }

  /* === Dark mode override === */
  @media (prefers-color-scheme: dark) {
    body, .wrap { background:#0d0d0d !important; }
    .card {
      background:#111111 !important;
      border-color:#5a2d9a !important;
      box-shadow:0 0 0 1px rgba(129,74,200,0.5),0 0 24px rgba(129,74,200,0.55),0 0 56px rgba(129,74,200,0.28),0 0 90px rgba(223,122,254,0.1) !important;
    }
    .logo-row {
      border-color:rgba(129,74,200,0.2) !important;
      background:linear-gradient(180deg,rgba(129,74,200,0.14) 0%,rgba(129,74,200,0) 100%) !important;
    }
    .heading { color:#ffffff !important; }
    .sub { color:#999999 !important; }
    .label { color:#666666 !important; }
    .pos-box { background:#1a1025 !important; border-color:#3d1f70 !important; }
    .pos-label { color:#666666 !important; }
    .ref-box { background:#1a1025 !important; border-color:#3d1f70 !important; }
    .ref-title { color:#c084f5 !important; }
    .ref-url { background:#0d0a14 !important; color:#c084f5 !important; border-color:#2a1a3e !important; }
    .item { color:#aaaaaa !important; border-color:#222222 !important; }
    .footer { color:#3a3a3a !important; }
  }
</style>
</head>
<body class="wrap" style="margin:0;padding:0;background:#ede8f5;font-family:'Clash Display',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table class="wrap" width="100%" cellpadding="0" cellspacing="0" style="background:#ede8f5;padding:40px 16px;">
<tr><td align="center">
<table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

  <tr><td class="card" style="background:#ffffff;border:2px solid #814ac8;border-radius:14px;padding:0;box-shadow:0 0 0 1px rgba(129,74,200,0.25),0 0 18px rgba(129,74,200,0.18),0 0 36px rgba(129,74,200,0.09);">

    <!-- Logo row -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td class="logo-row" style="padding:20px 28px 18px;border-bottom:1px solid rgba(129,74,200,0.22);background:linear-gradient(180deg,rgba(129,74,200,0.07) 0%,rgba(129,74,200,0) 100%);border-radius:12px 12px 0 0;">
        ${PITCHR_SVG}
      </td></tr>
    </table>

    <!-- Content -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:26px 28px 0;">

        <p style="margin:0 0 7px;font-size:10px;font-weight:700;letter-spacing:2px;color:#814ac8;text-transform:uppercase;">Waitlist confirmed</p>
        <h1 class="heading" style="margin:0 0 10px;font-size:24px;font-weight:800;color:#111111;line-height:1.25;">You're in${position <= 100 ? " early" : ""}${firstName ? `, ${firstName}` : ""}.</h1>
        <p class="sub" style="margin:0 0 22px;font-size:14px;color:#555555;line-height:1.65;">
          You're ${positionText} on the Pitchr waitlist. We're building the AI coach that tells you exactly what to say on every call, in real time, before the prospect hangs up.
        </p>

        <!-- Position -->
        <table class="pos-box" width="100%" cellpadding="0" cellspacing="0" style="background:#f3effe;border:1px solid #c9b0ee;border-radius:10px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p class="pos-label" style="margin:0 0 2px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#9b8aaa;font-weight:700;">Your position</p>
            ${positionSvg(position)}
          </td></tr>
        </table>

        <!-- Referral -->
        <table class="ref-box" width="100%" cellpadding="0" cellspacing="0" style="background:#f3effe;border:1px solid #c9b0ee;border-radius:10px;margin-bottom:22px;">
          <tr><td style="padding:16px 20px;">
            <p class="ref-title" style="margin:0 0 4px;font-size:13px;font-weight:700;color:#814ac8;">Move up the list →</p>
            <p class="sub" style="margin:0 0 10px;font-size:13px;color:#555555;line-height:1.5;">Share your link. Every signup through it bumps you higher.</p>
            <p class="ref-url" style="margin:0 0 12px;background:#ede6fa;border:1px solid #c9b0ee;border-radius:6px;padding:9px 12px;font-size:11px;color:#6b3db0;font-family:monospace;word-break:break-all;">${referralUrl}</p>
            <a href="${referralUrl}" style="display:inline-block;background:linear-gradient(135deg,#814ac8,#df7afe);color:#ffffff;text-decoration:none;border-radius:100px;padding:10px 22px;font-size:13px;font-weight:700;">Share your link</a>
          </td></tr>
        </table>

        <!-- What's next -->
        <p class="label" style="margin:0 0 10px;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888888;">What's next</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td class="item" style="padding:9px 0;border-bottom:1px solid #e8dff5;font-size:13px;color:#444444;"><strong>First to know</strong> the moment Pitchr drops</td></tr>
          <tr><td class="item" style="padding:9px 0;border-bottom:1px solid #e8dff5;font-size:13px;color:#444444;">Early <strong>offers and deals</strong> before anyone else sees them</td></tr>
          <tr><td class="item" style="padding:9px 0;font-size:13px;color:#444444;">We'll keep you <strong>in the loop</strong> as we build. No spam, ever.</td></tr>
        </table>

      </td></tr>
      <tr><td style="padding:20px 28px 24px;text-align:center;">
        <p class="footer" style="margin:0;font-size:11px;color:#aaaaaa;">You signed up at <a href="${APP_URL}" style="color:#814ac8;text-decoration:none;">pitchr.org</a> · © 2026 Pitchr</p>
      </td></tr>
    </table>

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
  const firstName = name.split(" ")[0] || "";

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
