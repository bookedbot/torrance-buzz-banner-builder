const canvas = document.getElementById("banner");
const ctx = canvas.getContext("2d");
const $ = (id) => document.getElementById(id);

const brand = {
  blue: "#1769AA",
  white: "#FFFFFF"
};

let referenceImage = null;

const presets = {
  events: {
    title: "Events Radar",
    subtitle: "What’s happening around Torrance this week",
    icon: "calendar",
    layout: "standard",
    accent: "soft-rings"
  },
  bites: {
    title: "Bites & Bottles",
    subtitle: "Worth a taste around Torrance",
    icon: "fork",
    layout: "standard",
    accent: "corner-bars"
  },
  hall: {
    title: "City Hall Watch",
    subtitle: "Local decisions, meetings and what they mean",
    icon: "civic",
    layout: "split",
    accent: "minimal"
  },
  home: {
    title: "Torrance Homefront",
    subtitle: "Housing, neighborhoods and local real estate",
    icon: "home",
    layout: "standard",
    accent: "soft-rings"
  },
  alerts: {
    title: "Torrance Buzz Alerts",
    subtitle: "Closures, advisories and useful local updates",
    icon: "alert",
    layout: "split",
    accent: "corner-bars"
  }
};

function iconGlyph(name) {
  return {
    calendar: "▦",
    spark: "✦",
    fork: "✣",
    home: "⌂",
    alert: "!",
    civic: "▥",
    sun: "☀",
    star: "★"
  }[name] || "✦";
}

function fitText(text, maxWidth, startSize, minSize = 22) {
  let size = startSize;

  while (size > minSize) {
    ctx.font = `800 ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }

  return size;
}

function drawAccent(type) {
  ctx.save();

  if (type === "soft-rings") {
    ctx.strokeStyle = "rgba(255,255,255,.13)";
    ctx.lineWidth = 4;
    [70, 105, 140].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(1120, 75, r + i * 5, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (type === "corner-bars") {
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.fillRect(1080, 0, 24, 150);
    ctx.fillRect(1120, 0, 10, 150);
    ctx.fillRect(1150, 0, 5, 150);
  } else {
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.fillRect(0, 145, 1200, 5);
  }

  ctx.restore();
}

function render() {
  const title = $("title").value.trim() || "Newsletter Banner";
  const subtitle = $("subtitle").value.trim();
  const layout = $("layout").value;
  const accent = $("accent").value;
  const icon = $("icon").value;

  ctx.clearRect(0, 0, 1200, 150);

  ctx.fillStyle = brand.blue;
  ctx.fillRect(0, 0, 1200, 150);

  const gradient = ctx.createLinearGradient(0, 0, 1200, 0);
  gradient.addColorStop(0, "rgba(4,56,94,.18)");
  gradient.addColorStop(.55, "rgba(23,105,170,0)");
  gradient.addColorStop(1, "rgba(4,56,94,.12)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 150);

  drawAccent(accent);
  ctx.textBaseline = "middle";

  if (layout === "centered") {
    ctx.fillStyle = "rgba(255,255,255,.16)";
    ctx.beginPath();
    ctx.arc(600, 30, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = brand.white;
    ctx.font = "700 25px Arial";
    ctx.textAlign = "center";
    ctx.fillText(iconGlyph(icon), 600, 30);

    const size = fitText(title, 960, 52);
    ctx.font = `800 ${size}px Arial`;
    ctx.fillText(title, 600, 78);

    if (subtitle) {
      ctx.font = "500 22px Arial";
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.fillText(subtitle, 600, 118);
    }
  } else {
    const iconX = layout === "split" ? 92 : 82;

    ctx.fillStyle = "rgba(255,255,255,.17)";
    ctx.beginPath();
    ctx.arc(iconX, 75, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = brand.white;
    ctx.textAlign = "center";
    ctx.font = "700 44px Arial";
    ctx.fillText(iconGlyph(icon), iconX, 77);

    const startX = layout === "split" ? 165 : 150;

    ctx.textAlign = "left";
    const size = fitText(title, 900, 52);
    ctx.font = `800 ${size}px Arial`;
    ctx.fillText(title, startX, 62);

    if (subtitle) {
      ctx.font = "500 22px Arial";
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.fillText(subtitle, startX, 108);
    }

    if (layout === "split") {
      ctx.fillStyle = "rgba(255,255,255,.13)";
      ctx.fillRect(1010, 25, 135, 100);

      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.font = "800 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("TORRANCE", 1077, 64);
      ctx.fillText("BUZZ WEEKLY", 1077, 88);
    }
  }
}

["title", "subtitle", "layout", "accent", "icon"].forEach((id) => {
  $(id).addEventListener("input", render);
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    Object.entries(preset).forEach(([key, value]) => {
      $(key).value = value;
    });
    render();
  });
});

$("reference").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    referenceImage = reader.result;
    $("referencePreview").src = referenceImage;
    $("referencePreview").hidden = false;

    try {
      localStorage.setItem("tbwReference", referenceImage);
    } catch {
      $("assistStatus").textContent = "Reference loaded, but it was too large to save in browser storage.";
    }
  };

  reader.readAsDataURL(file);
});

$("assist").addEventListener("click", async () => {
  const status = $("assistStatus");
  status.textContent = "Analyzing banner choices…";
  $("assist").disabled = true;

  try {
    const response = await fetch("/api/assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: $("title").value,
        notes: $("notes").value
      })
    });

    const data = await response.json();

    if (data.icon) $("icon").value = data.icon;
    if (data.layout) $("layout").value = data.layout;
    if (data.accent) $("accent").value = data.accent;

    render();

    status.textContent = `No-cost Smart Assist: ${data.rationale || "Suggestion applied."}`;
  } catch {
    status.textContent = "Smart Assist could not connect. The banner controls still work normally.";
  } finally {
    $("assist").disabled = false;
  }
});

$("download").addEventListener("click", () => {
  render();

  const link = document.createElement("a");
  const name = ($("title").value || "torrance-buzz-banner")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  link.download = `${name}-1200x150.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

$("savePreset").addEventListener("click", () => {
  const saved = {
    title: $("title").value,
    subtitle: $("subtitle").value,
    layout: $("layout").value,
    accent: $("accent").value,
    icon: $("icon").value
  };

  localStorage.setItem("tbwLastPreset", JSON.stringify(saved));
  $("assistStatus").textContent = "Preset saved in this browser.";
});

try {
  const saved = JSON.parse(localStorage.getItem("tbwLastPreset"));

  if (saved) {
    Object.entries(saved).forEach(([key, value]) => {
      if ($(key)) $(key).value = value;
    });
  }

  referenceImage = localStorage.getItem("tbwReference");

  if (referenceImage) {
    $("referencePreview").src = referenceImage;
    $("referencePreview").hidden = false;
  }
} catch {}

render();
