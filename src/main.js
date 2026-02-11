import "./style.css";
import bgImage from "./assets/valentine.jpg";

const app = document.querySelector("#app");

// 🎀 Fond image (uniquement la zone rose hors carte)
document.body.style.background = `
  linear-gradient(rgba(255, 210, 230, 0.70), rgba(255, 210, 230, 0.70)),
  url(${bgImage})
`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundAttachment = "fixed";
document.body.style.backgroundRepeat = "no-repeat";

app.innerHTML = `
  <main class="card">
    <h1>NEVE… tu veux être ma Valentine ? 💘</h1>

    <div class="playground" id="playground">
      <button id="yesBtn" class="btn neon yes" type="button">
        <span class="btn-inner">
          <span class="btn-icon">💖</span>
          <span class="btn-label">OUI</span>
        </span>
      </button>

      <button id="noBtn" class="btn neon no" type="button">
        <span class="btn-inner">
          <span class="btn-icon">💔</span>
          <span class="btn-label">NON</span>
        </span>
      </button>
    </div>

    <p id="status"></p>

    <section id="rewards" class="rewards" hidden>
      <h2>Ok… tu as dit OUI 😳💗</h2>
      <p>Voici ce à quoi tu as droit :</p>

      <ul class="rewards-list">
        <li>💐 Un bouquet de fleurs</li>
        <li>💋 10 bons bisous</li>
        <li>🫂 10 bons câlins</li>
        <li>🎁 1 bon “cadeau au choix”</li>
        <li>🍽️ 1 bon “date n’importe quand”</li>
        <li>🎬 1 soirée film + snacks</li>
      </ul>

      <p class="tiny">Tu peux prendre une capture d’écran 😌</p>
    </section>
  </main>
`;

// --- DOM refs ---
const playground = document.getElementById("playground");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const status = document.getElementById("status");
const rewards = document.getElementById("rewards");

const noIcon = noBtn.querySelector(".btn-icon");
const yesIcon = yesBtn.querySelector(".btn-icon");

// --- Messages ---
const messages = [
  "Tu es sûr ?",
  "Pourquoi tu ne dis pas oui ?",
  "Allez, stp accepte...",
  "Je t'ai préparé quelque chose 💌",
  "Tu vas me briser le cœur 😢",
];

let msgIndex = 0;
let lastMove = 0;
const MOVE_THROTTLE = 150; // ms

function moveNoButton(evt) {
  const now = Date.now();
  if (evt && evt.type === "mousemove" && now - lastMove < MOVE_THROTTLE) return;
  lastMove = now;

  const pad = 10;
  const zoneW = playground.clientWidth;
  const zoneH = playground.clientHeight;
  const btnW = noBtn.offsetWidth;
  const btnH = noBtn.offsetHeight;

  const maxLeft = Math.max(pad, zoneW - btnW - pad);
  const maxTop = Math.max(pad, zoneH - btnH - pad);

  let left = Math.random() * (maxLeft - pad) + pad;
  let top = Math.random() * (maxTop - pad) + pad;

  left = Math.min(Math.max(left, pad), maxLeft);
  top = Math.min(Math.max(top, pad), maxTop);

  noBtn.style.left = `${left}px`;
  noBtn.style.top = `${top}px`;
  noBtn.style.transform = "none";

  status.textContent = messages[msgIndex];
  noIcon.textContent = "💔";
  msgIndex = (msgIndex + 1) % messages.length;
}

["mouseenter", "mousemove", "click", "pointerenter", "pointermove", "touchstart"].forEach((evt) => {
  noBtn.addEventListener(
    evt,
    (e) => {
      if (evt === "touchstart") e.preventDefault();
      moveNoButton(e);
    },
    { passive: false }
  );
});

// 🌸 Fleurs qui tombent
const FLOWER_EMOJIS = ["🌸", "🌺", "💖", "🌷", "🌼"];

function spawnFlower() {
  const el = document.createElement("span");
  el.className = "flower";
  el.textContent = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];

  const size = 12 + Math.random() * 18;
  el.style.fontSize = `${size}px`;

  const left = Math.max(0, Math.random() * (playground.clientWidth - 20));
  el.style.left = `${left}px`;

  const dur = 4000 + Math.random() * 5200;
  el.style.animationDuration = `${dur}ms`;

  playground.appendChild(el);
  setTimeout(() => el.remove(), dur + 200);
}

let flowerInterval = setInterval(spawnFlower, 700);
if (window.innerWidth < 600) {
  clearInterval(flowerInterval);
  flowerInterval = setInterval(spawnFlower, 1100);
}

// ✅ Envoi Netlify
async function sendYesToNetlify() {
  const timestamp = new Date().toISOString();

  const payload = new URLSearchParams({
    "form-name": "valentine-yes",
    answer: "YES",
    name: "NEVE",
    timestamp,
  });

  const res = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!res.ok) throw new Error(`Netlify form failed: ${res.status}`);
}

yesBtn.addEventListener("click", async () => {
  status.textContent = "Ooooh… 😳💗 (envoi en cours…)";
  yesBtn.disabled = true;

  try {
    await sendYesToNetlify();
    rewards.hidden = false;
    status.textContent = "C’est officiel 💘";
    yesIcon.textContent = "💞";
  } catch (e) {
    console.error(e);
    status.textContent = "Oups… l’envoi a échoué. (Form Netlify pas détecté)";
    yesBtn.disabled = false;
  }
});
