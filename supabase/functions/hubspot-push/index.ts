import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const HUBSPOT_BASE = "https://api.hubapi.com";

async function hs(token: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${HUBSPOT_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`HubSpot ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { hubspotToken, session } = await req.json();
    if (!hubspotToken) throw new Error("No HubSpot token provided");

    const { config, aiSummary, followUpEmail, leadScore, finalCloseProbability, objectionsCount } = session;

    // ── 1. Find or create contact ──────────────────────────────────────────
    const nameParts = (config.prospectName as string).trim().split(/\s+/);
    const firstName = nameParts[0] ?? config.prospectName;
    const lastName  = nameParts.slice(1).join(" ");

    const searchResult = await hs(hubspotToken, "POST", "/crm/v3/objects/contacts/search", {
      filterGroups: [{
        filters: [{
          propertyName: "firstname",
          operator: "EQ",
          value: firstName,
        }],
      }],
      limit: 1,
    });

    let contactId: string;
    if ((searchResult.total as number) > 0) {
      contactId = searchResult.results[0].id as string;
      await hs(hubspotToken, "PATCH", `/crm/v3/objects/contacts/${contactId}`, {
        properties: { company: config.company ?? "" },
      });
    } else {
      const contact = await hs(hubspotToken, "POST", "/crm/v3/objects/contacts", {
        properties: { firstname: firstName, lastname: lastName, company: config.company ?? "" },
      });
      contactId = contact.id as string;
    }

    // ── 2. Create deal ─────────────────────────────────────────────────────
    const deal = await hs(hubspotToken, "POST", "/crm/v3/objects/deals", {
      properties: {
        dealname: `${config.prospectName} — ${config.callGoal}`,
        pipeline: "default",
        dealstage: (finalCloseProbability as number) >= 60 ? "presentationscheduled" : "appointmentscheduled",
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
      }],
    });

    // ── 3. Create note with AI summary ─────────────────────────────────────
    const noteBody = [
      `CALLASSIST SUMMARY`,
      `══════════════════`,
      `Prospect : ${config.prospectName} @ ${config.company}`,
      `Goal     : ${config.callGoal}`,
      `Close %  : ${finalCloseProbability}%`,
      `Lead Score: ${leadScore}/100`,
      `Objections: ${objectionsCount}`,
      ``,
      aiSummary,
      ``,
      `────────────────────`,
      `FOLLOW-UP EMAIL`,
      `────────────────────`,
      followUpEmail,
    ].join("\n");

    await hs(hubspotToken, "POST", "/crm/v3/objects/notes", {
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
        },
        {
          to: { id: deal.id },
          types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
        },
      ],
    });

    return new Response(
      JSON.stringify({ success: true, contactId, dealId: deal.id }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    console.error("hubspot-push error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
