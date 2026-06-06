# Pitchr — Waitlist Email Sequences

Send these via Resend Broadcasts (Audience → Broadcasts).
Schedule: Email 2 sends 4 days after signup, Email 3 on launch day.

---

## Email 1 — Welcome (sent automatically on signup via Edge Function)

**Subject:** You're #[position] on the Pitchr waitlist  
**From:** Yamin from Pitchr <yamin@pitchr.org>

*Built into `supabase/functions/waitlist-signup/index.ts` — no manual action needed.*

---

## Email 2 — Building in Public (send ~4 days after signup)

**Subject:** What we've been building (a quick look inside Pitchr)
**From:** Yamin from Pitchr <yamin@pitchr.org>

---

Hey [first name],

Quick update from inside Pitchr HQ.

Since you joined the waitlist, here's what the team has been shipping:

**Real-time AI coaching — live on calls**
When a prospect says "we already have something," Pitchr picks it up in milliseconds and surfaces the exact reframe to use. Not a script. A contextual suggestion, based on what's actually being said. You decide whether to use it.

**Post-call intelligence that saves you 20+ minutes**
The moment you hang up: full transcript, AI summary, lead score, and a personalised follow-up email — all generated automatically. It's been tested on 500+ real sales calls.

**Objection library that learns from your calls**
Every objection you face goes into your personal coaching history. Pitchr shows you the patterns — what's coming up most, where you're losing momentum, how to fix it.

---

**The honest numbers:**
- Average SDR: 45–60 seconds of dead air after a tough objection  
- Pitchr target: that pause shrinks to under 5 seconds  
- Beta testers (our own calls): close rate up ~23% in the first 2 weeks

---

You're still #[position] on the list. Your referral link moves you up:

[referral URL]

Launch is close. I'll email you the moment it's live.

— Yamin  
Founder, Pitchr

---

## Email 3 — Launch Day

**Subject:** Pitchr is live — your early access is ready
**From:** Yamin from Pitchr <yamin@pitchr.org>

---

Hey [first name],

Today's the day.

Pitchr is officially live — and because you're on the waitlist, you get in first.

**What you get as a founding member:**
- 30% off the Growth plan, locked in for life
- Priority onboarding (real human, not a chatbot)
- Direct access to me for the first 30 days — reply to this email anytime

**[Download Pitchr for Windows →]** [link]

One thing to do first: when you open the app, go through the 2-minute setup and connect your microphone. That's all it takes. Your first call should feel different.

If you have a call today — run Pitchr on it. That's the fastest way to see what it does.

Let me know how it goes.

— Yamin  
Founder, Pitchr  
yamin@pitchr.org

P.S. If you referred friends, check your position — you may have moved up significantly. Founding discount stacks with your position benefit.

---

## Setup Instructions (Resend)

1. Go to **resend.com** → sign up / log in
2. Add your domain **pitchr.org** and verify DNS (adds SPF + DKIM)
3. Go to **Audiences** → create audience "Pitchr Waitlist"
4. Add `RESEND_API_KEY` to your Supabase project secrets:  
   Supabase Dashboard → Project → Settings → Edge Functions → Secrets
5. The welcome email (Email 1) sends automatically via the edge function
6. For Emails 2 and 3: use Resend **Broadcasts** to send to the full audience

## Domain verification in Resend (DNS records to add to pitchr.org)

Resend will give you the exact DNS records after you add your domain.
Typical records needed:
- SPF TXT record on `@`
- DKIM CNAME records (Resend provides 2)
- Optional: DMARC TXT record for deliverability
