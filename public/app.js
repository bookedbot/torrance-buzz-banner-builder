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
  const cy = 73;

  ctx.save();

  const halo = ctx.createRadialGradient(cx, cy, 8, cx, cy, 78);
  halo.addColorStop(0, "rgba(32,119,255,.42)");
  halo.addColorStop(.52, "rgba(4,67,164,.23)");
  halo.addColorStop(1, "rgba(1,13,45,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();

  const gold = ctx.createLinearGradient(65, 25, 165, 125);
  gold.addColorStop(0, "#FFD65A");
  gold.addColorStop(.28, "#FFB321");
  gold.addColorStop(.7, "#F18B16");
  gold.addColorStop(1, "#B95D08");

  const lightGold = ctx.createLinearGradient(65, 30, 150, 110);
  lightGold.addColorStop(0, "#FFF2A8");
  lightGold.addColorStop(.45, "#FFC63A");
  lightGold.addColorStop(1, "#E47A0A");

  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 9;
  ctx.shadowOffsetY = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (icon === "star") {
    // Trivia: dimensional quiz badge with question mark.
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.roundRect(70, 32, 88, 82, 18);
    ctx.fill();

    const inner = ctx.createLinearGradient(75, 36, 154, 108);
    inner.addColorStop(0, "#123B83");
    inner.addColorStop(1, "#071A47");
    ctx.shadowBlur = 0;
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.roundRect(78, 40, 72, 66, 14);
    ctx.fill();

    ctx.fillStyle = "#FFD34B";
    ctx.shadowColor = "rgba(255,179,33,.65)";
    ctx.shadowBlur = 10;
    ctx.font = "italic 900 52px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", cx, 72);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.beginPath();
    ctx.ellipse(102, 47, 19, 6, -.35, 0, Math.PI * 2);
    ctx.fill();

    // Small raised answer chips.
    [["A",64,104],["B",91,116],["C",139,113]].forEach(([t,x,y]) => {
      ctx.fillStyle = lightGold;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#072254";
      ctx.font = "800 10px Arial";
      ctx.fillText(t, x, y + .5);
    });
  } else if (icon === "calendar") {
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.roundRect(66, 40, 98, 78, 12);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#F7F3E2";
    ctx.beginPath();
    ctx.roundRect(73, 55, 84, 56, 6);
    ctx.fill();

    ctx.fillStyle = "#0A2C68";
    ctx.fillRect(73, 55, 84, 17);

    ctx.fillStyle = "#FFD34B";
    [89,142].forEach(x => {
      ctx.beginPath();
      ctx.roundRect(x - 5, 31, 10, 28, 5);
      ctx.fill();
    });

    ctx.fillStyle = "#194F9C";
    for (let r = 0; r < 2; r++) {
      for (let col = 0; col < 4; col++) {
        ctx.beginPath();
        ctx.roundRect(83 + col * 17, 80 + r * 17, 10, 10, 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.beginPath();
    ctx.ellipse(100, 49, 30, 6, -.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === "home") {
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(61, 73);
    ctx.lineTo(115, 31);
    ctx.lineTo(169, 73);
    ctx.lineTo(158, 82);
    ctx.lineTo(115, 48);
    ctx.lineTo(72, 82);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = lightGold;
    ctx.beginPath();
    ctx.roundRect(78, 72, 74, 50, 5);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0B3477";
    ctx.fillRect(108, 91, 19, 31);

    const win = ctx.createLinearGradient(84,82,102,101);
    win.addColorStop(0,"#D7F2FF");
    win.addColorStop(1,"#4FA1E3");
    ctx.fillStyle = win;
    ctx.fillRect(86, 84, 18, 18);
    ctx.fillRect(132, 84, 13, 18);
  } else if (icon === "alert") {
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(115, 27);
    ctx.lineTo(170, 121);
    ctx.lineTo(60, 121);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#071A47";
    ctx.beginPath();
    ctx.moveTo(115, 43);
    ctx.lineTo(153, 109);
    ctx.lineTo(77, 109);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#FFD34B";
    ctx.font = "900 57px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", 115, 86);

    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.beginPath();
    ctx.moveTo(92,48);
    ctx.lineTo(113,34);
    ctx.lineTo(122,50);
    ctx.closePath();
    ctx.fill();
  } else if (icon === "sun") {
    ctx.strokeStyle = "#FFB321";
    ctx.lineWidth = 8;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 43, cy + Math.sin(a) * 43);
      ctx.lineTo(cx + Math.cos(a) * 59, cy + Math.sin(a) * 59);
      ctx.stroke();
    }

    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    const shine = ctx.createRadialGradient(99,55,2,99,55,25);
    shine.addColorStop(0,"rgba(255,255,255,.85)");
    shine.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(101,56,24,0,Math.PI*2);
    ctx.fill();
  } else if (icon === "fork") {
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.roundRect(69, 31, 20, 91, 8);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#071A47";
    [73,79,85].forEach(x => ctx.fillRect(x,31,3,28));

    ctx.fillStyle = lightGold;
    ctx.beginPath();
    ctx.ellipse(141, 55, 25, 27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(134, 56, 14, 66);

    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.beginPath();
    ctx.ellipse(133,45,9,5,-.4,0,Math.PI*2);
    ctx.fill();
  } else if (icon === "civic") {
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(57, 55);
    ctx.lineTo(115, 26);
    ctx.lineTo(173, 55);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = lightGold;
    ctx.fillRect(64, 108, 102, 12);
    [73,96,119,142].forEach(x => {
      ctx.fillRect(x, 61, 14, 45);
    });

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0A2D67";
    [78,101,124,147].forEach(x => {
      ctx.fillRect(x, 67, 5, 33);
    });

    ctx.fillStyle = "rgba(255,255,255,.62)";
    ctx.beginPath();
    ctx.moveTo(75,50);
    ctx.lineTo(115,31);
    ctx.lineTo(132,40);
    ctx.closePath();
    ctx.fill();
  } else {
    // Spark: glossy gold burst.
    ctx.fillStyle = gold;
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.roundRect(-11, -52, 22, 104, 9);
    ctx.fill();
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.roundRect(-11, -52, 22, 104, 9);
    ctx.fill();
    ctx.rotate(-3 * Math.PI / 4);
    ctx.shadowBlur = 0;
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
