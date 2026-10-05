const canvas = document.getElementById("banner");
const ctx = canvas.getContext("2d");
const $ = (id) => document.getElementById(id);

const brand = {
  navy: "#011037",
  navy2: "#06265F",
  cream: "#F6F1DE",
  orange: "#F99E1E",
  orange2: "#FFB21C",
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
    layout: "standard",
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
    layout: "standard",
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

function splitHeadline(title) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { first: title, last: "" };
  return {
    first: words.slice(0, -1).join(" "),
    last: words[words.length - 1]
  };
}

function fitTitle(first, last, maxWidth, startSize = 54, minSize = 28) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `italic 800 ${size}px Arial, sans-serif`;
    const gap = last ? 18 : 0;
    const width = ctx.measureText(first).width + gap + ctx.measureText(last).width;
    if (width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawMasterBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 1200, 150);
  gradient.addColorStop(0, "#010D2D");
  gradient.addColorStop(.48, "#031947");
  gradient.addColorStop(1, "#02133A");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 150);

  const glow = ctx.createRadialGradient(720, 65, 10, 720, 65, 520);
  glow.addColorStop(0, "rgba(20,91,196,.19)");
  glow.addColorStop(.58, "rgba(5,42,101,.08)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 150);

  ctx.save();
  ctx.strokeStyle = "rgba(52,115,223,.55)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(35,103,235,.5)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(330, 95);
  ctx.lineTo(1150, 95);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,.05)";
  ctx.fillRect(0, 0, 1200, 1);
}

function drawAccent(type) {
  ctx.save();

  if (type === "soft-rings") {
    ctx.strokeStyle = "rgba(64,119,224,.16)";
    ctx.lineWidth = 3;
    [64, 92].forEach((r) => {
      ctx.beginPath();
      ctx.arc(1120, 75, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (type === "corner-bars") {
    const g = ctx.createLinearGradient(1080, 0, 1200, 0);
    g.addColorStop(0, "rgba(249,158,30,0)");
    g.addColorStop(1, "rgba(249,158,30,.20)");
    ctx.fillStyle = g;
    ctx.fillRect(1050, 0, 150, 150);
  } else {
    ctx.fillStyle = "rgba(249,158,30,.32)";
    ctx.fillRect(1115, 17, 54, 4);
  }

  ctx.restore();
}

function drawIcon(icon) {
  const cx = 115;
  const cy = 72;

  ctx.save();

  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 72);
  glow.addColorStop(0, "rgba(20,110,255,.36)");
  glow.addColorStop(.55, "rgba(6,64,154,.20)");
  glow.addColorStop(1, "rgba(2,16,55,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = brand.orange;
  ctx.fillStyle = brand.orange2;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(26,99,235,.75)";
  ctx.shadowBlur = 14;

  if (icon === "calendar") {
    ctx.strokeRect(70, 42, 90, 72);
    ctx.fillRect(70, 42, 90, 18);
    ctx.fillStyle = brand.cream;
    ctx.shadowBlur = 0;
    for (let r = 0; r < 2; r++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(82 + col * 18, 72 + r * 18, 9, 9);
      }
    }
  } else if (icon === "star") {
    const spikes = 5, outer = 44, inner = 20;
    let rot = Math.PI / 2 * 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
      rot += Math.PI / spikes;
      ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += Math.PI / spikes;
    }
    ctx.closePath();
    ctx.fill();
  } else if (icon === "home") {
    ctx.beginPath();
    ctx.moveTo(68, 73);
    ctx.lineTo(115, 34);
    ctx.lineTo(162, 73);
    ctx.stroke();
    ctx.fillRect(82, 72, 66, 48);
    ctx.fillStyle = brand.navy;
    ctx.fillRect(109, 88, 18, 32);
  } else if (icon === "alert") {
    ctx.beginPath();
    ctx.moveTo(115, 28);
    ctx.lineTo(166, 118);
    ctx.lineTo(64, 118);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = brand.orange2;
    ctx.font = "800 58px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 115, 87);
  } else if (icon === "sun") {
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 38, cy + Math.sin(a) * 38);
      ctx.lineTo(cx + Math.cos(a) * 56, cy + Math.sin(a) * 56);
      ctx.stroke();
    }
  } else if (icon === "fork") {
    ctx.beginPath();
    ctx.moveTo(84, 34);
    ctx.lineTo(84, 116);
    ctx.stroke();
    [72,84,96].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, 34);
      ctx.lineTo(x, 64);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(146, 34);
    ctx.lineTo(146, 116);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(146, 48, 20, Math.PI, 0);
    ctx.stroke();
  } else if (icon === "civic") {
    ctx.beginPath();
    ctx.moveTo(70, 54);
    ctx.lineTo(115, 30);
    ctx.lineTo(160, 54);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(68, 108, 94, 8);
    [80,104,128,152].forEach(x => ctx.fillRect(x, 60, 10, 46));
  } else if (icon === "spark") {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-10, -48, 20, 96);
    ctx.rotate(Math.PI / 2);
    ctx.fillRect(-10, -48, 20, 96);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function render() {
  const title = $("title").value.trim() || "Newsletter Banner";
  const subtitle = $("subtitle").value.trim();
  const accent = $("accent").value;
  const icon = $("icon").value;
  const layout = $("layout").value;

  ctx.clearRect(0, 0, 1200, 150);
  drawMasterBackground();
  drawAccent(accent);
  drawIcon(icon);

  const { first, last } = splitHeadline(title);

  let headlineX = 220;
  let headlineY = 58;
  let maxWidth = 890;

  if (layout === "centered") {
    headlineX = 600;
    headlineY = 58;
    maxWidth = 780;
  } else if (layout === "split") {
    headlineX = 245;
    maxWidth = 760;
  }

  const fontSize = fitTitle(first, last, maxWidth);
  ctx.font = `italic 800 ${fontSize}px Arial, sans-serif`;
  ctx.textBaseline = "middle";

  if (layout === "centered") {
    const gap = last ? 18 : 0;
    const firstWidth = ctx.measureText(first).width;
    const lastWidth = ctx.measureText(last).width;
    const total = firstWidth + gap + lastWidth;
    let start = headlineX - total / 2;

    ctx.textAlign = "left";
    ctx.fillStyle = brand.cream;
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 2;
    ctx.fillText(first, start, headlineY);

    if (last) {
      start += firstWidth + gap;
      ctx.fillStyle = brand.orange;
      ctx.fillText(last, start, headlineY);
    }
  } else {
    ctx.textAlign = "left";
    ctx.fillStyle = brand.cream;
    ctx.shadowColor = "rgba(0,0,0,.35)";
    ctx.shadowBlur = 2;
    ctx.fillText(first, headlineX, headlineY);

    if (last) {
      const firstWidth = ctx.measureText(first).width;
      ctx.fillStyle = brand.orange;
      ctx.fillText(last, headlineX + firstWidth + 18, headlineY);
    }
  }

  ctx.shadowBlur = 0;

  if (subtitle) {
    ctx.font = "500 25px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.textAlign = layout === "centered" ? "center" : "left";
    const sx = layout === "centered" ? 600 : headlineX + 38;
    ctx.fillText(subtitle, sx, 111);
  }
}

function saveCurrentState() {
  const saved = {
    title: $("title").value,
    subtitle: $("subtitle").value,
    layout: $("layout").value,
    accent: $("accent").value,
    icon: $("icon").value
  };
  localStorage.setItem("tbwLastPreset", JSON.stringify(saved));
}

["title", "subtitle", "layout", "accent", "icon"].forEach((id) => {
  $(id).addEventListener("input", () => {
    render();
    saveCurrentState();
  });
  $(id).addEventListener("change", () => {
    render();
    saveCurrentState();
  });
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    Object.entries(preset).forEach(([key, value]) => {
      $(key).value = value;
    });
    render();
    saveCurrentState();
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
      $("assistStatus").textContent = "Master-style reference saved in this browser.";
    } catch {
      $("assistStatus").textContent = "Reference loaded, but it was too large to save in browser storage.";
    }
  };

  reader.readAsDataURL(file);
});

$("assist").addEventListener("click", async () => {
  const status = $("assistStatus");
  status.textContent = "Choosing the best approved icon and accent…";
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
    $("layout").value = "standard";
    if (data.accent) $("accent").value = data.accent;

    render();
    saveCurrentState();

    status.textContent = "Master style preserved. Smart Assist changed only approved details.";
  } catch {
    status.textContent = "Smart Assist could not connect. Master style remains locked.";
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
  saveCurrentState();
  $("assistStatus").textContent = "Banner settings saved. Changes are also saved automatically.";
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
