import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY   = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL       = "Yamin from Pitchr <yamin@pitchr.org>";
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
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr><td style="padding-bottom:32px;">
    <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#814ac8,#df7afe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Pitchr</span>
  </td></tr>

  <!-- Hero -->
  <tr><td style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;padding:40px 36px;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:2px;color:#814ac8;text-transform:uppercase;">Waitlist confirmed</p>
    <h1 style="margin:0 0 16px;font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;">You're in${position <= 100 ? ", early" : ""}, ${firstName}.</h1>
    <p style="margin:0 0 32px;font-size:16px;color:#888888;line-height:1.6;">
      You're ${positionText} on the Pitchr waitlist. We're building the AI coach that tells you exactly what to say on every call — in real time, before the prospect hangs up.
    </p>

    <!-- Position badge -->
    <div style="background:#111111;border:1px solid #222222;border-radius:12px;padding:20px 24px;margin-bottom:32px;display:inline-block;width:100%;box-sizing:border-box;">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#555555;">Your position</p>
      <p style="margin:0;font-size:40px;font-weight:900;color:#df7afe;line-height:1;">#${position}</p>
    </div>

    <!-- Referral -->
    <div style="background:#0d0a14;border:1px solid #2a1a3e;border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#df7afe;">Move up the list →</p>
      <p style="margin:0 0 16px;font-size:14px;color:#888888;line-height:1.5;">Share your personal link. Every person who joins through your link bumps you higher.</p>
      <a href="${referralUrl}" style="display:block;background:#1a1a1a;border:1px solid #333333;border-radius:8px;padding:12px 16px;font-size:13px;color:#df7afe;text-decoration:none;word-break:break-all;font-family:monospace;">${referralUrl}</a>
      <a href="${referralUrl}" style="display:inline-block;margin-top:16px;background:linear-gradient(135deg,#814ac8,#df7afe);color:#ffffff;text-decoration:none;border-radius:100px;padding:12px 24px;font-size:14px;font-weight:600;">Share your link</a>
    </div>

    <!-- What to expect -->
    <div style="border-top:1px solid #1a1a1a;padding-top:24px;">
      <p style="margin:0 0 16px;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#555555;">What happens next</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #111111;">
            <span style="color:#814ac8;font-size:18px;vertical-align:middle;">→</span>
            <span style="margin-left:12px;font-size:14px;color:#aaaaaa;vertical-align:middle;">We'll send you a preview of the app before anyone else</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #111111;">
            <span style="color:#814ac8;font-size:18px;vertical-align:middle;">→</span>
            <span style="margin-left:12px;font-size:14px;color:#aaaaaa;vertical-align:middle;">Early access 2 weeks before public launch</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#814ac8;font-size:18px;vertical-align:middle;">→</span>
            <span style="margin-left:12px;font-size:14px;color:#aaaaaa;vertical-align:middle;">Founding member discount locked in for life</span>
          </td>
        </tr>
      </table>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#333333;">You're receiving this because you signed up at pitchr.org</p>
    <p style="margin:4px 0 0;font-size:12px;color:#333333;">© 2026 Pitchr · <a href="${APP_URL}" style="color:#555555;text-decoration:none;">pitchr.org</a></p>
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
