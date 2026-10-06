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
let customIconBannerKey = null;
let iconVariant = 0;
let premiumBannerImage = null;
let premiumBannerDataUrl = null;
let premiumBannerAccepted = false;
let premiumIconDataUrl = null;
let premiumIconImage = null;
const premiumAssets = {};
const bitesAsset = new Image();
bitesAsset.onload = () => {
  premiumAssets.fooddrink = bitesAsset;
  render();
};
bitesAsset.src = "/icons/Bites%20%26%20Bottles%20Gourmet%20Still%20Life.png";

const cityHallAsset = new Image();
cityHallAsset.onload = () => {
  premiumAssets.civic = cityHallAsset;
  render();
};
cityHallAsset.src = "/icons/Golden%20Courthouse%20and%20Gavel%20Emblem.png";

const healthWatchAsset = new Image();
healthWatchAsset.onload = () => {
  premiumAssets.health = healthWatchAsset;
  render();
};
healthWatchAsset.src = "/icons/Golden%20Heart%20Medical%20Cross%20with%20Stethoscope.png";

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
  const t = title.toLowerCase().trim();
  const n = notes.toLowerCase().trim();

  // Known newsletter sections always use their approved section visual first.
  if (/^trivia time$/.test(t)) return "brain";
  if (/^the buzz in 60 seconds$/.test(t)) return "lightning";
  if (/^this week'?s big buzz$/.test(t)) return "megaphone";
  if (/hidden gems/.test(t)) return "gem";
  if (/torrance explained/.test(t)) return "compass";
  if (/^events radar$/.test(t)) return "calendar";
  if (/bites\s*&\s*bottles/.test(t)) return "fooddrink";
  if (/city hall watch/.test(t)) return "civic";
  if (/torrance homefront/.test(t)) return "home";
  if (/buzz alerts/.test(t)) return "alert";
  if (/health watch/.test(t)) return "health";

  // Design notes guide new or unfamiliar banners.
  if (/brain|mind|memory|thinking|knowledge|quiz|trivia/.test(n)) return "brain";
  if (/lightning|thunder|bolt|electric|speed|fast/.test(n)) return "lightning";
  if (/gem|gems|diamond|jewel|treasure/.test(n)) return "gem";
  if (/compass|map|explore|discovery|mystery|history/.test(n)) return "compass";
  if (/megaphone|headline|news|breaking|buzz/.test(n)) return "megaphone";
  if (/calendar|event|festival|concert|weekend/.test(n)) return "calendar";
  const hasFood = /food|restaurant|bite|dining|eat|meal|plate|fork/.test(n);
  const hasDrink = /drink|bottle|wine|cocktail|coffee|beer|glass|sip|sipping/.test(n);
  if (hasFood && hasDrink) return "fooddrink";
  if (hasFood || hasDrink) return "fork";
  if (/home|house|housing|real estate|property|mortgage/.test(n)) return "home";
  if (/alert|warning|traffic|closure|advisory|emergency/.test(n)) return "alert";
  if (/city|council|government|civic|planning|commission/.test(n)) return "civic";
  if (/health|medical|doctor|hospital|wellness|stethoscope|heart|clinic/.test(n)) return "health";
  if (/weather|sun|heat|rain|forecast|temperature/.test(n)) return "sun";
  if (/fun|game|star|play|entertainment/.test(n)) return "star";

  if (/event|festival|concert|weekend/.test(t)) return "calendar";
  if (/food|restaurant|bite|drink|bottle|dining/.test(t)) return "fork";
  if (/home|housing|property|real estate/.test(t)) return "home";
  if (/alert|warning|closure|advisory/.test(t)) return "alert";
  if (/city|council|government|civic/.test(t)) return "civic";
  if (/weather|forecast|heat|rain/.test(t)) return "sun";
  if (/news|headline|buzz|spotlight/.test(t)) return "megaphone";

  return "spark";
}

function currentBannerKey() {
  return ($("title").value || "").trim().toLowerCase();
}

function syncCustomIconToBanner() {
  const key = currentBannerKey();
  if (customIconImage && customIconBannerKey && customIconBannerKey !== key) {
    customIconImage = null;
    customIconDataUrl = null;
    customIconBannerKey = null;
    $("customIcon").value = "";
    $("customIconPreview").hidden = true;
    $("customIconPreview").src = "";
    $("clearCustomIcon").hidden = true;
  }
}

function createNewIconVariation() {
  customIconImage = null;
  customIconDataUrl = null;
  customIconBannerKey = null;
  $("customIcon").value = "";
  $("customIconPreview").hidden = true;
  $("customIconPreview").src = "";
  $("clearCustomIcon").hidden = true;

  $("icon").value = inferIcon($("title").value, $("notes").value);
  iconVariant = (iconVariant + 1) % 3;

  render();
  saveCurrentState();
  $("assistStatus").textContent = "New visual variation created for the same concept.";
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

function drawPremiumAsset(icon) {
  const image = premiumAssets[icon];
  if (!image || !image.complete || !image.naturalWidth) return false;

  const boxX = 54;
  const boxY = -2;
  const boxW = 175;
  const boxH = 160;

  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const scale = Math.min(boxW / iw, boxH / ih);
  const w = iw * scale;
  const h = ih * scale;
  const x = boxX + (boxW - w) / 2;
  const y = boxY + (boxH - h) / 2;

  ctx.save();
  ctx.shadowColor = "rgba(21,91,226,.72)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();

  return true;
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

function drawIcon(icon, variant = 0) {
  const cx = 115;
  const cy = 73;

  ctx.save();

  const halo = ctx.createRadialGradient(cx - 10, cy - 10, 6, cx, cy, 82);
  halo.addColorStop(0, "rgba(92,162,255,.55)");
  halo.addColorStop(.38, "rgba(31,102,235,.30)");
  halo.addColorStop(.72, "rgba(5,48,128,.16)");
  halo.addColorStop(1, "rgba(1,13,45,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();

  const gold = ctx.createLinearGradient(62, 20, 170, 130);
  gold.addColorStop(0, "#FFF4AF");
  gold.addColorStop(.18, "#FFD85A");
  gold.addColorStop(.48, "#FFB024");
  gold.addColorStop(.76, "#E88712");
  gold.addColorStop(1, "#9F4303");

  const lightGold = ctx.createLinearGradient(62, 22, 155, 118);
  lightGold.addColorStop(0, "#FFF9D0");
  lightGold.addColorStop(.35, "#FFE17D");
  lightGold.addColorStop(.68, "#FFB629");
  lightGold.addColorStop(1, "#D66E08");

  ctx.shadowColor = "rgba(0,0,0,.62)";
  ctx.shadowBlur = 13;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (icon === "compass") {
    // Dimensional compass for Torrance Explained / discovery sections.
    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = "rgba(25,93,220,.75)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    const rim = ctx.createRadialGradient(-12, -15, 5, 0, 0, 56);
    rim.addColorStop(0, "#FFF1A0");
    rim.addColorStop(.35, "#FFC644");
    rim.addColorStop(.72, "#EF9318");
    rim.addColorStop(1, "#A94B05");

    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    const face = ctx.createRadialGradient(-10, -12, 4, 0, 0, 42);
    face.addColorStop(0, "#174D9A");
    face.addColorStop(.55, "#0B2F6C");
    face.addColorStop(1, "#061A47");
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.stroke();

    // Needle.
    ctx.fillStyle = "#FFD34A";
    ctx.beginPath();
    ctx.moveTo(0, -31);
    ctx.lineTo(10, 5);
    ctx.lineTo(0, 0);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#F07E16";
    ctx.beginPath();
    ctx.moveTo(0, 31);
    ctx.lineTo(-9, -4);
    ctx.lineTo(0, 0);
    ctx.lineTo(8, -4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#F6F1DE";
    ctx.font = "800 11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", 0, -24);
    ctx.fillText("S", 0, 25);
    ctx.fillText("W", -25, 1);
    ctx.fillText("E", 25, 1);

    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.beginPath();
    ctx.ellipse(-18, -22, 15, 5, -.55, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  } else if (icon === "gem") {
    // Dimensional faceted gemstone for Hidden Gems / discovery sections.
    ctx.save();
    ctx.translate(cx, cy);

    const gemGrad = ctx.createLinearGradient(-44, -42, 42, 46);
    gemGrad.addColorStop(0, "#FFF6B0");
    gemGrad.addColorStop(.18, "#FFD85A");
    gemGrad.addColorStop(.48, "#FFAE24");
    gemGrad.addColorStop(.78, "#E47D10");
    gemGrad.addColorStop(1, "#9C4704");

    ctx.shadowColor = "rgba(22,92,220,.75)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = gemGrad;
    ctx.beginPath();
    ctx.moveTo(-42, -20);
    ctx.lineTo(-22, -43);
    ctx.lineTo(24, -43);
    ctx.lineTo(44, -20);
    ctx.lineTo(0, 48);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(126,55,2,.5)";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-42, -20);
    ctx.lineTo(44, -20);
    ctx.moveTo(-22, -43);
    ctx.lineTo(0, 48);
    ctx.moveTo(24, -43);
    ctx.lineTo(0, 48);
    ctx.moveTo(-42, -20);
    ctx.lineTo(0, 48);
    ctx.moveTo(44, -20);
    ctx.lineTo(0, 48);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.beginPath();
    ctx.moveTo(-19, -36);
    ctx.lineTo(3, -36);
    ctx.lineTo(-7, -24);
    ctx.lineTo(-28, -24);
    ctx.closePath();
    ctx.fill();

    // Small sparkle accents around the gem.
    ctx.fillStyle = "#FFF1A3";
    [[-56,-29,5],[54,-10,4],[-48,26,3]].forEach(([x,y,r]) => {
      ctx.beginPath();
      ctx.moveTo(x, y-r*2);
      ctx.lineTo(x+r*.7, y-r*.7);
      ctx.lineTo(x+r*2, y);
      ctx.lineTo(x+r*.7, y+r*.7);
      ctx.lineTo(x, y+r*2);
      ctx.lineTo(x-r*.7, y+r*.7);
      ctx.lineTo(x-r*2, y);
      ctx.lineTo(x-r*.7, y-r*.7);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  } else if (icon === "megaphone") {
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
  } else if (icon === "fooddrink") {
    ctx.save();
    ctx.translate(cx, cy);

    const glassGold = ctx.createLinearGradient(-58,-50,58,58);
    glassGold.addColorStop(0,"#FFF8C9");
    glassGold.addColorStop(.18,"#FFE27B");
    glassGold.addColorStop(.48,"#FFB52D");
    glassGold.addColorStop(.76,"#E78512");
    glassGold.addColorStop(1,"#984105");

    const bottleGrad = ctx.createLinearGradient(-20,-45,25,48);
    bottleGrad.addColorStop(0,"#FFDB69");
    bottleGrad.addColorStop(.25,"#F8B127");
    bottleGrad.addColorStop(.62,"#D9780D");
    bottleGrad.addColorStop(1,"#8E3A03");

    ctx.shadowColor="rgba(27,95,226,.78)";
    ctx.shadowBlur=18;
    ctx.shadowOffsetY=5;

    if (variant === 0) {
      // Plated entrée + wine glass.
      ctx.fillStyle="#F7F1DE";
      ctx.beginPath(); ctx.ellipse(-16,27,42,13,0,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;

      // Food on plate.
      const foodGrad=ctx.createRadialGradient(-20,15,2,-16,20,22);
      foodGrad.addColorStop(0,"#F9C766");
      foodGrad.addColorStop(.55,"#DE8A22");
      foodGrad.addColorStop(1,"#9B4A08");
      ctx.fillStyle=foodGrad;
      ctx.beginPath();
      ctx.ellipse(-17,18,24,10,-.12,0,Math.PI*2);
      ctx.fill();

      ctx.fillStyle="#5B9B45";
      ctx.beginPath(); ctx.ellipse(-33,12,9,4,-.6,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-2,11,8,3,.45,0,Math.PI*2); ctx.fill();

      // Fork.
      ctx.strokeStyle=glassGold; ctx.lineWidth=5; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(-61,-30); ctx.lineTo(-61,40); ctx.stroke();
      [-69,-63,-57].forEach(x=>{ctx.beginPath();ctx.moveTo(x,-30);ctx.lineTo(x,-8);ctx.stroke();});

      // Wine glass.
      ctx.shadowColor="rgba(34,106,244,.72)"; ctx.shadowBlur=12;
      ctx.strokeStyle="#FFE89A"; ctx.lineWidth=4.5;
      ctx.beginPath();
      ctx.moveTo(18,-34);
      ctx.bezierCurveTo(7,-15,9,8,28,15);
      ctx.bezierCurveTo(47,8,49,-15,38,-34);
      ctx.closePath(); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle="rgba(244,139,33,.82)";
      ctx.beginPath(); ctx.ellipse(28,2,12,6,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#FFD46B";
      ctx.beginPath();ctx.moveTo(28,15);ctx.lineTo(28,43);ctx.stroke();
      ctx.beginPath();ctx.moveTo(14,43);ctx.lineTo(42,43);ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.72)";
      ctx.beginPath();ctx.ellipse(18,-21,8,4,-.5,0,Math.PI*2);ctx.fill();

    } else if (variant === 1) {
      // Wine bottle + filled glass + tasting board.
      ctx.fillStyle="#D7A45C";
      ctx.beginPath(); ctx.roundRect(-53,26,48,10,5); ctx.fill();

      ctx.fillStyle=bottleGrad;
      ctx.shadowColor="rgba(24,91,216,.78)"; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.roundRect(-18,-13,29,59,9); ctx.fill();
      ctx.fillRect(-10,-41,13,29);

      // Bottle shoulders.
      ctx.beginPath();
      ctx.moveTo(-18,-13);ctx.quadraticCurveTo(-18,-23,-10,-26);
      ctx.lineTo(3,-26);ctx.quadraticCurveTo(11,-23,11,-13);ctx.closePath();ctx.fill();

      ctx.shadowBlur=0;
      ctx.fillStyle="#173B80"; ctx.beginPath();ctx.roundRect(-13,4,19,18,4);ctx.fill();
      ctx.fillStyle="#F6F1DE";ctx.font="800 7px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("TBW",-3.5,13);

      ctx.fillStyle="rgba(255,255,255,.58)";
      ctx.beginPath();ctx.ellipse(-9,-5,7,3,-.5,0,Math.PI*2);ctx.fill();

      // Glass.
      ctx.strokeStyle="#FFE791";ctx.lineWidth=4.5;
      ctx.shadowColor="rgba(24,91,216,.65)";ctx.shadowBlur=10;
      ctx.beginPath();
      ctx.moveTo(28,-30);ctx.bezierCurveTo(18,-12,20,8,36,14);ctx.bezierCurveTo(52,8,54,-12,44,-30);ctx.closePath();ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle="rgba(247,147,35,.86)";
      ctx.beginPath();ctx.ellipse(36,1,10,5,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(36,14);ctx.lineTo(36,41);ctx.stroke();
      ctx.beginPath();ctx.moveTo(24,41);ctx.lineTo(48,41);ctx.stroke();

      // Small tasting garnish on board.
      ctx.fillStyle="#F0C15B";ctx.beginPath();ctx.arc(-39,22,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#5E9F4C";ctx.beginPath();ctx.ellipse(-34,17,6,3,-.5,0,Math.PI*2);ctx.fill();

    } else {
      // Cocktail + covered dish.
      ctx.fillStyle=glassGold;
      ctx.shadowColor="rgba(27,95,226,.78)";ctx.shadowBlur=16;
      ctx.beginPath();ctx.arc(-19,14,31,Math.PI,0);ctx.lineTo(12,14);ctx.lineTo(-50,14);ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle="#FFD86A";ctx.beginPath();ctx.arc(-19,-18,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.58)";ctx.beginPath();ctx.ellipse(-28,-1,15,5,-.35,0,Math.PI*2);ctx.fill();

      ctx.strokeStyle="#FFE791";ctx.lineWidth=4.5;
      ctx.beginPath();ctx.moveTo(22,-31);ctx.lineTo(51,-31);ctx.lineTo(36,5);ctx.closePath();ctx.stroke();
      ctx.beginPath();ctx.moveTo(36,5);ctx.lineTo(36,36);ctx.stroke();
      ctx.beginPath();ctx.moveTo(24,36);ctx.lineTo(48,36);ctx.stroke();
      ctx.fillStyle="rgba(246,146,33,.84)";
      ctx.beginPath();ctx.moveTo(28,-26);ctx.lineTo(45,-26);ctx.lineTo(36,-9);ctx.closePath();ctx.fill();
      ctx.fillStyle="#FFD95D";ctx.beginPath();ctx.arc(51,-32,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#45934B";ctx.beginPath();ctx.ellipse(56,-38,8,3,-.7,0,Math.PI*2);ctx.fill();
    }

    ctx.restore();
  } else if (icon === "fork") {
    if (variant === 0) {
      // Fork + spoon.
      ctx.shadowColor = "rgba(25,91,220,.78)";
      ctx.shadowBlur = 18;
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

      ctx.fillStyle = "rgba(255,255,255,.72)";
      ctx.beginPath();
      ctx.ellipse(133,45,10,5,-.4,0,Math.PI*2);
      ctx.fill();
    } else if (variant === 1) {
      // Wine bottle + glass.
      const bottle = ctx.createLinearGradient(74,28,112,121);
      bottle.addColorStop(0,"#FFD95F");
      bottle.addColorStop(.45,"#F2A11C");
      bottle.addColorStop(1,"#A94D05");
      ctx.fillStyle = bottle;
      ctx.beginPath();
      ctx.roundRect(72,52,32,66,8);
      ctx.fill();
      ctx.fillRect(81,28,14,30);

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#FFD65A";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(135,44);
      ctx.bezierCurveTo(124,58,127,79,143,83);
      ctx.bezierCurveTo(159,79,162,58,151,44);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(143,83);
      ctx.lineTo(143,113);
      ctx.moveTo(129,113);
      ctx.lineTo(157,113);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.ellipse(84,61,8,4,-.4,0,Math.PI*2);
      ctx.fill();
    } else {
      // Plate + cloche.
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#F8EED0";
      ctx.beginPath();
      ctx.ellipse(114,100,52,14,0,0,Math.PI*2);
      ctx.fill();

      ctx.fillStyle = gold;
      ctx.beginPath();
      ctx.arc(114,76,38,Math.PI,0);
      ctx.lineTo(152,76);
      ctx.lineTo(76,76);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#FFD65A";
      ctx.beginPath();
      ctx.arc(114,36,8,0,Math.PI*2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,.58)";
      ctx.beginPath();
      ctx.ellipse(99,55,17,5,-.3,0,Math.PI*2);
      ctx.fill();
    }
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

function drawPremiumBannerBackground() {
  if (!premiumBannerImage || !premiumBannerImage.complete || !premiumBannerImage.naturalWidth) return false;

  const iw = premiumBannerImage.naturalWidth;
  const ih = premiumBannerImage.naturalHeight;
  const targetRatio = 1200 / 150;
  const imageRatio = iw / ih;

  let sx = 0, sy = 0, sw = iw, sh = ih;

  if (imageRatio > targetRatio) {
    sw = ih * targetRatio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / targetRatio;
    sy = (ih - sh) / 2;
  }

  ctx.drawImage(premiumBannerImage, sx, sy, sw, sh, 0, 0, 1200, 150);

  const shade = ctx.createLinearGradient(0, 0, 1200, 0);
  shade.addColorStop(0, "rgba(1,10,38,.08)");
  shade.addColorStop(.22, "rgba(1,10,38,.20)");
  shade.addColorStop(.38, "rgba(1,10,38,.56)");
  shade.addColorStop(.82, "rgba(1,10,38,.18)");
  shade.addColorStop(1, "rgba(1,10,38,.12)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, 1200, 150);

  return true;
}

function drawPremiumText(title, subtitle) {
  const { first, last } = splitHeadline(title);
  const headlineX = 300;
  const maxWidth = 815;
  const fontSize = fitTitle(first, last, maxWidth, 50, 28);

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `italic 800 ${fontSize}px Arial, sans-serif`;
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 4;
  ctx.fillStyle = brand.cream;
  ctx.fillText(first, headlineX, 58);

  if (last) {
    const firstWidth = ctx.measureText(first).width;
    ctx.fillStyle = brand.orange;
    ctx.fillText(last, headlineX + firstWidth + 17, 58);
  }

  ctx.shadowBlur = 2;
  if (subtitle) {
    ctx.font = "500 23px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.fillText(subtitle, headlineX + 34, 108);
  }
  ctx.shadowBlur = 0;
}

function render() {
  const title = $("title").value.trim() || "Newsletter Banner";
  const subtitle = $("subtitle").value.trim();
  const accent = $("accent").value;
  const icon = $("icon").value;
  const layout = $("layout").value;

  ctx.clearRect(0, 0, 1200, 150);

  if (premiumBannerImage) {
    drawPremiumBannerBackground();
    drawPremiumText(title, subtitle);
    return;
  }

  drawMasterBackground();
  drawAccent(accent);
  syncCustomIconToBanner();
  if (!drawCustomIcon() && !drawPremiumAsset(icon)) drawIcon(icon, iconVariant);

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

function markPremiumIconNeedsRefresh() {
  if (premiumIconImage) {
    $("premiumIconStatus").textContent = "Title or Design notes changed. Generate another icon if you want it matched to the new direction.";
  }
}

function markPremiumNeedsRefresh() {
  if (premiumBannerImage) {
    premiumBannerAccepted = false;
    $("premiumStatus").textContent = "Text or direction changed. Generate again if you want artwork matched to the new details.";
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
    customIconDataUrl,
    customIconBannerKey,
    iconVariant,
    premiumBannerAccepted
  };
  localStorage.setItem("tbwLastPreset", JSON.stringify(saved));
}

["title", "subtitle", "layout", "accent", "icon"].forEach((id) => {
  $(id).addEventListener("input", () => {
    if ((id === "title" || id === "subtitle") && !customIconImage) {
      $("icon").value = inferIcon($("title").value, $("notes").value);
      iconVariant = 0;
    }
    if (id === "title" || id === "subtitle") {
      markPremiumNeedsRefresh();
      if (id === "title") markPremiumIconNeedsRefresh();
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
  markPremiumNeedsRefresh();
  markPremiumIconNeedsRefresh();
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

$("newIcon").addEventListener("click", createNewIconVariation);

$("customIcon").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    customIconDataUrl = reader.result;
    customIconBannerKey = currentBannerKey();
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

async function generatePremiumIcon() {
  const button = $("generatePremiumIcon");
  const status = $("premiumIconStatus");
  const actions = $("premiumIconActions");
  const previewWrap = $("premiumIconPreviewWrap");

  button.disabled = true;
  status.textContent = "Creating a premium transparent icon… this can take a little while.";
  actions.hidden = true;

  try {
    const response = await fetch("/api/premium-icon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: $("title").value,
        notes: $("notes").value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      status.textContent = data.message || "Premium icon generation failed.";
      return;
    }

    const image = new Image();
    image.onload = () => {
      premiumIconDataUrl = data.image;
      premiumIconImage = image;
      $("premiumIconPreview").src = data.image;
      previewWrap.hidden = false;
      actions.hidden = false;
      status.textContent = "Premium icon generated. Use it or generate another.";
    };
    image.onerror = () => {
      status.textContent = "The generated premium icon could not be loaded.";
    };
    image.src = data.image;
  } catch (error) {
    status.textContent = "Premium icon generation could not connect.";
  } finally {
    button.disabled = false;
  }
}

$("generatePremiumIcon").addEventListener("click", generatePremiumIcon);
$("generateAnotherIcon").addEventListener("click", generatePremiumIcon);

$("usePremiumIcon").addEventListener("click", () => {
  if (!premiumIconImage || !premiumIconDataUrl) return;

  customIconImage = premiumIconImage;
  customIconDataUrl = premiumIconDataUrl;
  customIconBannerKey = currentBannerKey();

  $("customIconPreview").src = premiumIconDataUrl;
  $("customIconPreview").hidden = false;
  $("clearCustomIcon").hidden = false;

  render();
  saveCurrentState();

  $("premiumIconStatus").textContent = "Premium icon selected for this banner.";
  $("assistStatus").textContent = "Premium icon is now being used for this banner.";
});

async function generatePremiumBanner() {
  const button = $("generatePremium");
  const status = $("premiumStatus");
  const actions = $("premiumActions");

  button.disabled = true;
  status.textContent = "Creating premium banner artwork… this can take a little while.";
  actions.hidden = true;

  try {
    const response = await fetch("/api/premium-banner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: $("title").value,
        subtitle: $("subtitle").value,
        notes: $("notes").value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === "missing_api_key") {
        status.textContent = "Premium Banner is ready, but an OpenAI API key must be added once in Railway before image generation can run.";
      } else {
        status.textContent = data.message || "Premium banner generation failed.";
      }
      return;
    }

    const image = new Image();
    image.onload = () => {
      premiumBannerImage = image;
      premiumBannerDataUrl = data.image;
      premiumBannerAccepted = false;
      render();
      actions.hidden = false;
      status.textContent = "Premium banner generated. Keep it or generate another.";
    };
    image.onerror = () => {
      status.textContent = "The generated artwork could not be loaded.";
    };
    image.src = data.image;
  } catch (error) {
    status.textContent = "Premium banner generation could not connect.";
  } finally {
    button.disabled = false;
  }
}

$("generatePremium").addEventListener("click", generatePremiumBanner);
$("generateAnother").addEventListener("click", generatePremiumBanner);

$("usePremium").addEventListener("click", () => {
  if (!premiumBannerImage) return;
  premiumBannerAccepted = true;
  $("premiumStatus").textContent = "Premium banner selected. Use Download PNG when ready.";
  saveCurrentState();
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
      if ($(key) && key !== "customIconDataUrl" && key !== "customIconBannerKey") $(key).value = value;
    });

    if (Number.isInteger(saved.iconVariant)) iconVariant = saved.iconVariant;

    if (saved.customIconBannerKey) customIconBannerKey = saved.customIconBannerKey;

    if (saved.customIconDataUrl && saved.customIconBannerKey === currentBannerKey()) {
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
