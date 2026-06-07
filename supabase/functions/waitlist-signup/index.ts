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
  body, .wrap { background:#0d0d0d !important; }

  .card {
    background:#111111 !important;
    border:2px solid #5a2d9a !important;
    border-radius:14px !important;
    box-shadow:0 0 0 1px rgba(129,74,200,0.5),0 0 24px rgba(129,74,200,0.55),0 0 56px rgba(129,74,200,0.28),0 0 80px rgba(223,122,254,0.1) !important;
  }
  .logo-sep { border-color:rgba(129,74,200,0.25) !important; }
  .heading { color:#ffffff !important; }
  .sub { color:#999999 !important; }
  .label { color:#666666 !important; }
  .pos-box { background:#1a1025 !important; border-color:#3d1f70 !important; }
  .ref-box { background:#1a1025 !important; border-color:#3d1f70 !important; }
  .ref-url { background:#0d0a14 !important; color:#c084f5 !important; border-color:#2a1a3e !important; }
  .item { color:#aaaaaa !important; border-color:#222222 !important; }
  .footer { color:#3a3a3a !important; }

  @media (prefers-color-scheme: light) {
    body, .wrap { background:#f0edf7 !important; }
    .card {
      background:#ffffff !important;
      border-color:#814ac8 !important;
      box-shadow:0 0 0 1px rgba(129,74,200,0.3),0 0 20px rgba(129,74,200,0.2),0 0 40px rgba(129,74,200,0.1) !important;
    }
    .heading { color:#111111 !important; }
    .sub { color:#555555 !important; }
    .label { color:#888888 !important; }
    .pos-box { background:#f5f0ff !important; border-color:#cdb4f0 !important; }
    .ref-box { background:#f5f0ff !important; border-color:#cdb4f0 !important; }
    .ref-url { background:#ede6fa !important; color:#6b3db0 !important; border-color:#cdb4f0 !important; }
    .item { color:#444444 !important; border-color:#e8e0f5 !important; }
    .footer { color:#999999 !important; }
  }
</style>
</head>
<body class="wrap" style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table class="wrap" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Single unified card — everything inside -->
  <tr><td class="card" style="background:#111111;border:2px solid #5a2d9a;border-radius:14px;padding:0;box-shadow:0 0 0 1px rgba(129,74,200,0.5),0 0 24px rgba(129,74,200,0.55),0 0 56px rgba(129,74,200,0.28);">

    <!-- Logo row inside card -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td class="logo-sep" style="padding:22px 32px 20px;border-bottom:1px solid rgba(129,74,200,0.2);">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:10px;vertical-align:middle;">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#814ac8"/><stop offset="100%" stop-color="#df7afe"/></linearGradient></defs>
              <rect width="100" height="100" rx="22" fill="#0a0a0a"/>
              <path fill-rule="evenodd" fill="url(#pg)" d="M 26 22 Q 26 14 32 14 L 54 14 C 78 14 78 62 54 62 L 44 62 L 44 82 Q 44 88 37 88 Q 26 88 26 82 Z M 44 28 L 53 28 C 65 28 65 50 53 50 L 44 50 Z"/>
            </svg>
          </td>
          <td style="vertical-align:middle;">
            <span style="font-size:18px;font-weight:800;letter-spacing:1px;background:linear-gradient(135deg,#814ac8,#df7afe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#814ac8;">PITCHR</span>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <!-- Content -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:32px 32px 0;">

        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;color:#814ac8;text-transform:uppercase;">Waitlist confirmed</p>
        <h1 class="heading" style="margin:0 0 12px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.2;">You're in${position <= 100 ? ", early" : ""}, ${firstName}.</h1>
        <p class="sub" style="margin:0 0 28px;font-size:14px;color:#999999;line-height:1.6;">
          You're ${positionText} on the Pitchr waitlist. We're building the AI coach that tells you exactly what to say on every call — in real time, before the prospect hangs up.
        </p>

        <!-- Position -->
        <table class="pos-box" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1025;border:1px solid #3d1f70;border-radius:10px;margin-bottom:16px;">
          <tr><td style="padding:18px 22px;">
            <p class="label" style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666666;font-weight:600;">Your position</p>
            <p style="margin:0;font-size:42px;font-weight:900;line-height:1;background:linear-gradient(135deg,#814ac8,#df7afe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;color:#814ac8;">#${position}</p>
          </td></tr>
        </table>

        <!-- Referral -->
        <table class="ref-box" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1025;border:1px solid #3d1f70;border-radius:10px;margin-bottom:28px;">
          <tr><td style="padding:18px 22px;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#c084f5;">Move up the list →</p>
            <p class="sub" style="margin:0 0 12px;font-size:13px;color:#999999;line-height:1.5;">Share your link. Every signup through it bumps you higher.</p>
            <p class="ref-url" style="margin:0 0 12px;background:#0d0a14;border:1px solid #2a1a3e;border-radius:6px;padding:9px 12px;font-size:11px;color:#c084f5;font-family:monospace;word-break:break-all;">${referralUrl}</p>
            <a href="${referralUrl}" style="display:inline-block;background:linear-gradient(135deg,#814ac8,#df7afe);color:#ffffff;text-decoration:none;border-radius:100px;padding:10px 22px;font-size:13px;font-weight:700;">Share your link</a>
          </td></tr>
        </table>

        <!-- What's next -->
        <p class="label" style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#666666;">What happens next</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td class="item" style="padding:9px 0;border-bottom:1px solid #222222;font-size:13px;color:#aaaaaa;">
            <span style="color:#814ac8;font-weight:700;">→</span>&nbsp;&nbsp;App preview sent before anyone else
          </td></tr>
          <tr><td class="item" style="padding:9px 0;border-bottom:1px solid #222222;font-size:13px;color:#aaaaaa;">
            <span style="color:#814ac8;font-weight:700;">→</span>&nbsp;&nbsp;Early access 2 weeks before public launch
          </td></tr>
          <tr><td class="item" style="padding:9px 0;font-size:13px;color:#aaaaaa;">
            <span style="color:#814ac8;font-weight:700;">→</span>&nbsp;&nbsp;Founding member discount locked in for life
          </td></tr>
        </table>

      </td></tr>
      <!-- Footer inside card -->
      <tr><td style="padding:24px 32px 28px;text-align:center;">
        <p class="footer" style="margin:0;font-size:11px;color:#3a3a3a;">You signed up at <a href="${APP_URL}" style="color:#814ac8;text-decoration:none;">pitchr.org</a> · © 2026 Pitchr</p>
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
