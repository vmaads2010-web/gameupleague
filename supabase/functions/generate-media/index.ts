// GAME UP LEAGUE — Social Studio automated generation
// Calls Google's Gemini API (image) or Veo API (video) server-side,
// enforcing hard caps so costs can never run away:
//   - MAX_PER_DAY generations (combined image+video) per calendar day
//   - MAX_MONTH_PAISE total spend per calendar month
// Secrets required (set via `supabase secrets set`): GEMINI_API_KEY
// Env vars (set in Supabase dashboard, Edge Function settings):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase)

import { createClient } from "jsr:@supabase/supabase-js@2";

const MAX_PER_DAY = 10;
const MAX_MONTH_PAISE = 50000; // ₹500

// Real Google per-image cost (1K resolution Nano Banana 2.1), in paise.
const IMAGE_COST_PAISE = 280;
// Veo 3.1 Lite, per second, in paise (~₹4.2/sec) - video length is capped
// at 5 seconds below to keep a single generation affordable and predictable.
const VIDEO_COST_PER_SEC_PAISE = 420;
const VIDEO_MAX_SECONDS = 5;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const supabase = createClient(supabaseUrl, serviceKey);

  let body: { type?: string; prompt?: string; referenceImages?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { type, prompt, referenceImages } = body;
  if (type !== "image" && type !== "video") {
    return json({ error: "type must be 'image' or 'video'" }, 400);
  }
  if (!prompt || !prompt.trim()) {
    return json({ error: "prompt is required" }, 400);
  }
  if (!geminiKey) {
    return json({ error: "Server not configured yet - GEMINI_API_KEY missing. Ask Vishal to set it up." }, 503);
  }

  // ---- Caps check (server-side, can't be bypassed from the browser) ----
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: todayCount, error: dayErr } = await supabase
    .from("generation_usage")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfDay);
  if (dayErr) return json({ error: "Usage check failed: " + dayErr.message }, 500);
  if ((todayCount ?? 0) >= MAX_PER_DAY) {
    return json({ error: `Daily limit reached (${MAX_PER_DAY}/day). Try again tomorrow.` }, 429);
  }

  const { data: monthRows, error: monthErr } = await supabase
    .from("generation_usage")
    .select("cost_paise")
    .gte("created_at", startOfMonth);
  if (monthErr) return json({ error: "Usage check failed: " + monthErr.message }, 500);
  const monthSpent = (monthRows ?? []).reduce((sum, r) => sum + r.cost_paise, 0);

  const estimatedCost = type === "image" ? IMAGE_COST_PAISE : VIDEO_COST_PER_SEC_PAISE * VIDEO_MAX_SECONDS;
  if (monthSpent + estimatedCost > MAX_MONTH_PAISE) {
    return json({
      error: `Monthly budget cap reached (₹${(MAX_MONTH_PAISE / 100).toFixed(0)}/month). Resets next month.`,
    }, 429);
  }

  // ---- Call Google's API ----
  try {
    if (type === "image") {
      const parts: any[] = [{ text: prompt }];
      for (const img of referenceImages ?? []) {
        const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
      }

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] }),
        },
      );
      const data = await resp.json();
      if (!resp.ok) return json({ error: "Gemini API error: " + JSON.stringify(data).slice(0, 300) }, 502);

      const imgPart = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData || p.inline_data);
      const inline = imgPart?.inlineData ?? imgPart?.inline_data;
      if (!inline) return json({ error: "Gemini did not return an image." }, 502);

      const bytes = Uint8Array.from(atob(inline.data), (c) => c.charCodeAt(0));
      const fileName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
      const { error: upErr } = await supabase.storage
        .from("generated-media")
        .upload(fileName, bytes, { contentType: inline.mimeType ?? "image/png" });
      if (upErr) return json({ error: "Upload failed: " + upErr.message }, 500);

      await supabase.from("generation_usage").insert({ kind: "image", cost_paise: IMAGE_COST_PAISE });

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/generated-media/${fileName}`;
      return json({ url: publicUrl, cost_paise: IMAGE_COST_PAISE });
    }

    // ---- Video (Veo) - async: starts a long-running operation, polls it ----
    const startResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-lite-generate-preview:predictLongRunning?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { durationSeconds: VIDEO_MAX_SECONDS },
        }),
      },
    );
    const startData = await startResp.json();
    if (!startResp.ok) return json({ error: "Veo API error: " + JSON.stringify(startData).slice(0, 300) }, 502);

    const opName = startData.name;
    if (!opName) return json({ error: "Veo did not return an operation." }, 502);

    let opData: any = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 6000));
      const pollResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${opName}?key=${geminiKey}`,
      );
      opData = await pollResp.json();
      if (opData.done) break;
    }
    if (!opData?.done) return json({ error: "Video generation timed out. Try again in a minute." }, 504);

    const videoUri = opData?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (!videoUri) return json({ error: "Veo did not return a video: " + JSON.stringify(opData).slice(0, 300) }, 502);

    const videoResp = await fetch(`${videoUri}&key=${geminiKey}`);
    const videoBytes = new Uint8Array(await videoResp.arrayBuffer());
    const fileName = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.mp4`;
    const { error: upErr } = await supabase.storage
      .from("generated-media")
      .upload(fileName, videoBytes, { contentType: "video/mp4" });
    if (upErr) return json({ error: "Upload failed: " + upErr.message }, 500);

    const actualCost = VIDEO_COST_PER_SEC_PAISE * VIDEO_MAX_SECONDS;
    await supabase.from("generation_usage").insert({ kind: "video", cost_paise: actualCost });

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/generated-media/${fileName}`;
    return json({ url: publicUrl, cost_paise: actualCost });
  } catch (e) {
    return json({ error: "Unexpected error: " + String(e).slice(0, 300) }, 500);
  }
});
