/* =========================================================
   락페에서 살아남기 — 동작
   ========================================================= */

const STAGE_W = 1728;
const STAGE_H = 1117;
const stage = document.getElementById("stage");

/* ---------- 1. 화면 크기에 맞춰 스테이지 확대/축소 ---------- */
function fitStage() {
  const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", fitStage);
fitStage();

/* ---------- 2. 타이틀 글자를 한 글자씩 쪼개서 파도 모션 ---------- */
let charIndex = 0;
document.querySelectorAll(".title-line").forEach((line) => {
  [...line.dataset.text].forEach((ch) => {
    const span = document.createElement("span");
    span.className = "wave-char";
    span.textContent = ch;
    span.style.setProperty("--i", charIndex++);
    line.appendChild(span);
  });
});

/* ---------- 3. 만화풍 뾰족 테두리 만들기 ---------- */
// 타원 둘레를 돌면서 바깥/안쪽 점을 번갈아 찍어 clip-path 를 만든다.
function burstPolygon(spikes, seed) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 0.5 : 0.5 - (0.07 + rand() * 0.07);
    const x = 50 + Math.cos(a) * r * 100;
    const y = 50 + Math.sin(a) * r * 100;
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
}
document.querySelectorAll(".burst").forEach((el, n) => {
  const poly = burstPolygon(22, 7 + n * 13);
  el.style.clipPath = poly;
  el.querySelector(".burst-inner").style.clipPath = poly;
});

/* ---------- 4. 타이핑 효과 ---------- */
const TYPE_SPEED = 55; // 글자당 ms
const typers = new Map();

function startTyping(page) {
  const el = page.querySelector(".typing");
  if (!el) return;
  const btn = page.querySelector(".after-typing");
  const text = JSON.parse(el.dataset.lines).join("\n");

  stopTyping(page);
  el.textContent = "";
  el.classList.remove("done");
  if (btn) btn.classList.remove("show");

  let i = 0;
  const finish = () => {
    clearInterval(state.timer);
    el.textContent = text;
    el.classList.add("done");
    if (btn) btn.classList.add("show");
  };
  const state = {
    finish,
    timer: setInterval(() => {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) finish();
    }, TYPE_SPEED),
  };
  typers.set(page, state);
}
function stopTyping(page) {
  const t = typers.get(page);
  if (t) clearInterval(t.timer);
}

// 타이핑 중 대화창을 클릭하면 바로 전체 문장 표시
document.querySelectorAll(".dialog-lg").forEach((box) => {
  box.addEventListener("click", () => {
    const t = typers.get(box.closest(".page"));
    if (t) t.finish();
  });
});

/* ---------- 5. 페이지 이동 ---------- */
function goTo(id) {
  const next = document.getElementById(id);
  if (!next) return;
  document.querySelectorAll(".page.is-active").forEach((p) => {
    p.classList.remove("is-active");
    stopTyping(p);
  });
  next.classList.add("is-active");
  // 페이지가 나타나는 전환(0.5초) 도중부터 타이핑 시작
  setTimeout(() => startTyping(next), 350);
}

document.querySelectorAll("[data-go]").forEach((btn) => {
  btn.addEventListener("click", () => goTo(btn.dataset.go));
});

/* ---------- 6. 이미지 미리 불러오기 ---------- */
["bg.jpg", "bg_crowd.jpg", "char1.png", "char2.png", "char3.png", "char4.png",
 "bag_black.png", "bag_sky.png", "bag_beige.png", "rock.png"].forEach((f) => {
  new Image().src = `img/${f}`;
});
