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
let customIconImage = null;
let customIconDataUrl = null;

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
    star: "★",
    brain: "?"
  }[name] || "✦";
}

function inferIcon(title = "", notes = "") {
  const combined = `${title} ${notes}`.toLowerCase();

  // Strong topic matches first.
  if (/brain|mind|memory|thinking|knowledge|quiz|trivia/.test(combined)) return "brain";
  if (/lightning|thunder|bolt|electric|speed|fast/.test(combined)) return "lightning";
  if (/buzz|breaking|headline|news|happening|spotlight|big buzz|what matters/.test(combined)) return "megaphone";
  if (/calendar|event|festival|concert|show|weekend/.test(combined)) return "calendar";
  if (/food|restaurant|bite|drink|bottle|dining|eat/.test(combined)) return "fork";
  if (/home|house|housing|real estate|property|mortgage/.test(combined)) return "home";
  if (/alert|warning|traffic|closure|advisory|emergency/.test(combined)) return "alert";
  if (/city|council|hall|government|civic|planning|commission/.test(combined)) return "civic";
  if (/weather|sun|heat|rain|forecast|temperature/.test(combined)) return "sun";
  if (/fun|game|star|play|entertainment/.test(combined)) return "star";

  // Generic design notes should not force an unrelated icon.
  return "spark";
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

function drawCustomIcon() {
  if (!customIconImage) return false;

  const boxX = 56;
  const boxY = 17;
  const boxW = 120;
  const boxH = 116;

  const iw = customIconImage.naturalWidth || customIconImage.width;
  const ih = customIconImage.naturalHeight || customIconImage.height;
  if (!iw || !ih) return false;

  const scale = Math.min(boxW / iw, boxH / ih);
  const w = iw * scale;
  const h = ih * scale;
  const x = boxX + (boxW - w) / 2;
  const y = boxY + (boxH - h) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(17,79,196,.55)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 3;
  ctx.drawImage(customIconImage, x, y, w, h);
  ctx.restore();

  return true;
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

  if (icon === "megaphone") {
    // Polished megaphone illustration for news/buzz/headline sections.
    ctx.save();
    ctx.translate(cx, cy);

    const cone = ctx.createLinearGradient(-40, -25, 45, 25);
    cone.addColorStop(0, "#FFF0A0");
    cone.addColorStop(.32, "#FFC844");
    cone.addColorStop(.7, "#F49A1B");
    cone.addColorStop(1, "#B85B08");

    ctx.shadowColor = "rgba(31,104,235,.7)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(-44, -17);
    ctx.lineTo(24, -36);
    ctx.lineTo(24, 36);
    ctx.lineTo(-44, 17);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#FFB421";
    ctx.beginPath();
    ctx.roundRect(-58, -21, 20, 42, 7);
    ctx.fill();

    ctx.fillStyle = "#E67F0D";
    ctx.beginPath();
    ctx.moveTo(-8, 28);
    ctx.lineTo(13, 28);
    ctx.lineTo(4, 58);
    ctx.lineTo(-16, 58);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.beginPath();
    ctx.moveTo(-29, -12);
    ctx.lineTo(15, -25);
    ctx.lineTo(15, -16);
    ctx.lineTo(-24, -4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#FFB421";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    [-24, 0, 24].forEach((offset) => {
      ctx.beginPath();
      ctx.moveTo(38, offset * .45);
      ctx.lineTo(58, offset * .65);
      ctx.stroke();
    });

    ctx.restore();
  } else if (icon === "lightning") {
    // Dimensional lightning bolt with metallic gold face and blue glow.
    ctx.save();
    ctx.translate(cx, cy);

    const bolt = ctx.createLinearGradient(-30, -50, 30, 50);
    bolt.addColorStop(0, "#FFF3A3");
    bolt.addColorStop(.28, "#FFD34A");
    bolt.addColorStop(.62, "#F7A51D");
    bolt.addColorStop(1, "#B85A07");

    ctx.shadowColor = "rgba(36,111,255,.85)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = bolt;

    ctx.beginPath();
    ctx.moveTo(12, -54);
    ctx.lineTo(-27, 6);
    ctx.lineTo(-5, 6);
    ctx.lineTo(-24, 52);
    ctx.lineTo(30, -12);
    ctx.lineTo(7, -12);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.beginPath();
    ctx.moveTo(5, -43);
    ctx.lineTo(-16, -6);
    ctx.lineTo(-6, -6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,182,32,.72)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-54 - i*3, -24 + i*25);
      ctx.lineTo(-37 - i*2, -16 + i*25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(48 + i*2, -21 + i*24);
      ctx.lineTo(63 + i*3, -13 + i*24);
      ctx.stroke();
    }

    ctx.restore();
  } else if (icon === "brain") {
    // Dimensional brain illustration: recognizable lobes, midline and grooves.
    ctx.save();
    ctx.translate(cx, cy);

    const brainFill = ctx.createLinearGradient(-48, -42, 45, 46);
    brainFill.addColorStop(0, "#FFE48A");
    brainFill.addColorStop(.25, "#FFC247");
    brainFill.addColorStop(.58, "#F59A1F");
    brainFill.addColorStop(1, "#B95B08");

    ctx.fillStyle = brainFill;
    ctx.strokeStyle = "#FFD466";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(0,0,0,.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.moveTo(0, -42);
    ctx.bezierCurveTo(-18, -53, -38, -45, -43, -28);
    ctx.bezierCurveTo(-61, -27, -66, -5, -54, 6);
    ctx.bezierCurveTo(-63, 23, -45, 40, -29, 35);
    ctx.bezierCurveTo(-21, 50, -2, 51, 0, 38);
    ctx.bezierCurveTo(4, 51, 23, 50, 29, 35);
    ctx.bezierCurveTo(48, 41, 64, 24, 54, 6);
    ctx.bezierCurveTo(67, -5, 61, -27, 43, -28);
    ctx.bezierCurveTo(39, -45, 17, -53, 0, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(108,48,4,.58)";
    ctx.lineWidth = 3;

    const grooves = [
      [-28,-28,-38,-16,-25,-8],
      [-18,-37,-8,-25,-16,-13],
      [-38,-2,-28,7,-35,18],
      [-22,7,-11,15,-19,28],
      [25,-29,38,-18,25,-8],
      [18,-37,7,-24,16,-13],
      [38,-1,28,8,35,18],
      [23,7,11,15,19,28]
    ];

    grooves.forEach(([x1,y1,cx1,cy1,x2,y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.quadraticCurveTo(cx1,cy1,x2,y2);
      ctx.stroke();
    });

    ctx.strokeStyle = "rgba(94,41,3,.72)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0,-40);
    ctx.bezierCurveTo(-3,-16,3,10,0,39);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.beginPath();
    ctx.ellipse(-22,-27,14,5,-.5,0,Math.PI*2);
    ctx.fill();

    ctx.restore();
  } else if (icon === "star") {
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
  if (!drawCustomIcon()) drawIcon(icon);

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
    icon: $("icon").value,
    notes: $("notes").value,
    customIconDataUrl
  };
  localStorage.setItem("tbwLastPreset", JSON.stringify(saved));
}

["title", "subtitle", "layout", "accent", "icon"].forEach((id) => {
  $(id).addEventListener("input", () => {
    if ((id === "title" || id === "subtitle") && !customIconImage) {
      $("icon").value = inferIcon($("title").value, $("notes").value);
    }
    render();
    saveCurrentState();
  });
  $(id).addEventListener("change", () => {
    if ((id === "title" || id === "subtitle") && !customIconImage) {
      $("icon").value = inferIcon($("title").value, $("notes").value);
    }
    render();
    saveCurrentState();
  });
});

$("notes").addEventListener("input", () => {
  const suggested = inferIcon($("title").value, $("notes").value);
  if (suggested) $("icon").value = suggested;
  render();
  saveCurrentState();
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

$("customIcon").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    customIconDataUrl = reader.result;
    const image = new Image();
    image.onload = () => {
      customIconImage = image;
      $("customIconPreview").src = customIconDataUrl;
      $("customIconPreview").hidden = false;
      $("clearCustomIcon").hidden = false;
      render();
      saveCurrentState();
      $("assistStatus").textContent = "Custom icon loaded and saved for this banner.";
    };
    image.src = customIconDataUrl;
  };

  reader.readAsDataURL(file);
});

$("clearCustomIcon").addEventListener("click", () => {
  customIconImage = null;
  customIconDataUrl = null;
  $("customIcon").value = "";
  $("customIconPreview").hidden = true;
  $("customIconPreview").src = "";
  $("clearCustomIcon").hidden = true;
  render();
  saveCurrentState();
  $("assistStatus").textContent = "Custom icon removed. Built-in icon restored.";
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
      if ($(key) && key !== "customIconDataUrl") $(key).value = value;
    });

    if (saved.customIconDataUrl) {
      customIconDataUrl = saved.customIconDataUrl;
      const image = new Image();
      image.onload = () => {
        customIconImage = image;
        $("customIconPreview").src = customIconDataUrl;
        $("customIconPreview").hidden = false;
        $("clearCustomIcon").hidden = false;
        render();
      };
      image.src = customIconDataUrl;
    }
  }

  referenceImage = localStorage.getItem("tbwReference");

  if (referenceImage) {
    $("referencePreview").src = referenceImage;
    $("referencePreview").hidden = false;
  }

  const noteDrivenIcon = inferIcon($("title").value, $("notes").value);
  if (noteDrivenIcon) {
    $("icon").value = noteDrivenIcon;
    saveCurrentState();
  }
} catch {}

render();
