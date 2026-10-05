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
