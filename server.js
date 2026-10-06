import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "6mb" }));
app.use(express.static(path.join(__dirname, "public")));

function localAssist(title = "", notes = "") {
  const text = `${title} ${notes}`.toLowerCase();
  let icon = "spark";

  if (/event|calendar|festival|concert/.test(text)) icon = "calendar";
  else if (/food|bite|restaurant|drink|bottle/.test(text)) icon = "fork";
  else if (/home|real estate|housing/.test(text)) icon = "home";
  else if (/alert|warning|traffic|closure/.test(text)) icon = "alert";
  else if (/city|council|hall|government/.test(text)) icon = "civic";
  else if (/weather|sun|rain/.test(text)) icon = "sun";
  else if (/fun|trivia|game/.test(text)) icon = "star";

  return {
    mode: "local",
    icon,
    layout: "standard",
    accent: "soft-rings",
    rationale: "No-cost Smart Assist matched the title to an approved TBW visual category."
  };
}

app.post("/api/assist", (req, res) => {
  const { title = "", notes = "" } = req.body || {};
  res.json(localAssist(title, notes));
});

app.post("/api/premium-icon", async (req, res) => {
  const { title = "", notes = "" } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "missing_api_key",
      message: "Premium Icon generation needs an OpenAI API key configured on Railway."
    });
  }

  const prompt = [
    "Create one premium standalone icon for The Torrance Buzz Weekly newsletter.",
    "Transparent background. Square composition. One cohesive subject only.",
    "Do not render any text, letters, labels, logos, captions, frames, badges, or watermarks.",
    "Style benchmark: polished high-end 3D editorial illustration, photorealistic CGI quality, crisp silhouette, dimensional shading, rich reflections and highlights, professional rather than cartoonish.",
    "Brand styling: premium gold and orange highlights, deep navy/blue materials where useful, subtle cool blue rim lighting, strong contrast, clean readable silhouette at small size.",
    "Keep the complete object inside the canvas with comfortable transparent padding around all edges.",
    `Banner title/context: ${title || "Torrance local news"}.`,
    notes ? `Editor's visual direction: ${notes}.` : "",
    "Make the icon immediately understandable and visually specific to this section."
  ].filter(Boolean).join(" ");

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ICON_MODEL || "gpt-image-1",
        prompt,
        size: "1024x1024",
        quality: "low",
        background: "transparent",
        output_format: "png"
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error("Premium icon generation failed", payload);
      return res.status(response.status).json({
        error: "generation_failed",
        message: payload?.error?.message || "Premium icon generation failed."
      });
    }

    const imageBase64 = payload?.data?.[0]?.b64_json;
    if (!imageBase64) {
      return res.status(502).json({
        error: "empty_image",
        message: "The image service returned no icon."
      });
    }

    return res.json({
      image: `data:image/png;base64,${imageBase64}`,
      model: process.env.OPENAI_ICON_MODEL || "gpt-image-1"
    });
  } catch (error) {
    console.error("Premium icon generation error", error);
    return res.status(500).json({
      error: "generation_error",
      message: "Premium Icon generation could not complete."
    });
  }
});

app.post("/api/premium-banner", async (req, res) => {
  const { title = "", subtitle = "", notes = "" } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      error: "missing_api_key",
      message: "Premium Banner generation needs an OpenAI API key configured on Railway."
    });
  }

  const prompt = [
    "Create premium editorial artwork for a wide local-news newsletter banner for The Torrance Buzz Weekly.",
    "The final banner will be 1200 x 150 (8:1) and the generated image will be center-cropped, so keep ALL important subjects inside the middle horizontal band and avoid important details near the top or bottom.",
    "Do not render any text, letters, logos, captions, watermarks, or typography. The app will add exact text afterward.",
    "Visual benchmark: sophisticated, polished, high-end local magazine/newsletter banner, cinematic lighting, rich depth, crisp dimensional hero illustration, integrated background scene, subtle glow and light streaks, professional rather than cartoonish.",
    "Brand direction: deep navy and blue base, premium gold/orange highlights, optional teal/green accents when the subject calls for it, strong contrast, tasteful blue rim lighting.",
    "Composition: hero visual on the left 20-25%; clean darker text-safe area across the center; optional subtle Torrance/South Bay environmental cues on the right; no clutter.",
    `Section title concept: ${title || "Torrance local news"}.`,
    subtitle ? `Section meaning: ${subtitle}.` : "",
    notes ? `Creative direction from editor: ${notes}.` : "",
    "Make the subject unmistakably relevant to the section while preserving a consistent Torrance Buzz Weekly premium visual language."
  ].filter(Boolean).join(" ");

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
        prompt,
        size: "1536x1024",
        quality: "low",
        output_format: "png"
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      console.error("Premium image generation failed", payload);
      return res.status(response.status).json({
        error: "generation_failed",
        message: payload?.error?.message || "Image generation failed."
      });
    }

    const imageBase64 = payload?.data?.[0]?.b64_json;
    if (!imageBase64) {
      return res.status(502).json({
        error: "empty_image",
        message: "The image service returned no image."
      });
    }

    return res.json({
      image: `data:image/png;base64,${imageBase64}`,
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2"
    });
  } catch (error) {
    console.error("Premium banner generation error", error);
    return res.status(500).json({
      error: "generation_error",
      message: "Premium Banner generation could not complete."
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = Number(process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Torrance Buzz Banner Builder running on port ${port}`);
});
