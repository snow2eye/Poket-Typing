const GAME_TIME = 30;

const LEVELS = {
  easy:   { label: "EASY",   goal: 15 },
  normal: { label: "NORMAL", goal: 18 },
  hard:   { label: "HARD",   goal: 23 },
};
const MODES = {
  attack:    { label: "타임어택" },
  challenge: { label: "도전" },
};

const NAMES = [...new Set((
  "이상해씨,이상해풀,이상해꽃,파이리,리자드,리자몽,꼬부기,어니부기,거북왕,캐터피," +
  "단데기,버터플,뿔충이,딱충이,독침붕,구구,피죤,피죤투,꼬렛,레트라," +
  "깨비참,깨비드릴조,아보,아보크,피카츄,라이츄,모래두지,고지,니드런,니드리나," +
  "니드퀸,니드런,니드리노,니드킹,삐삐,픽시,식스테일,나인테일,푸린,푸크린," +
  "주뱃,골뱃,뚜벅쵸,냄새꼬,라플레시아,파라스,파라섹트,콘팡,도나리,디그다," +
  "닥트리오,나옹,페르시온,고라파덕,골덕,망키,성원숭,가디,윈디,발챙이," +
  "슈륙챙이,강챙이,캐이시,윤겔라,후딘,알통몬,근육몬,괴력몬,모다피,우츠동," +
  "우츠보트,왕눈해,독파리,꼬마돌,데구리,딱구리,포니타,날쌩마,야돈,야도란," +
  "코일,레어코일,파오리,두두,두트리오,쥬쥬,쥬레곤,질퍽이,질뻐기,셀러," +
  "파르셀,고오스,고우스트,팬텀,롱스톤,슬리프,슬리퍼,크랩,킹크랩,찌리리공," +
  "붐볼,아라리,나시,탕구리,텅구리,시라소몬,홍수몬,내루미,또가스,또도가스," +
  "뿔카노,코뿌리,럭키,덩쿠리,캥카,쏘드라,시드라,콘치,왕콘치,별가사리," +
  "아쿠스타,마임맨,스라크,루주라,에레브,마그마,쁘사이저,켄타로스,잉어킹,갸라도스," +
  "라프라스,메타몽,이브이,샤미드,쥬피썬더,부스터,폴리곤,암나이트,암스타,투구," +
  "투구푸스,프테라,잠만보,프리져,썬더,파이어,미뇽,신뇽,망나뇽,뮤츠,뮤"
).split(","))];

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ",
  "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const SPLIT = {
  "ㅘ": "ㅗㅏ", "ㅙ": "ㅗㅐ", "ㅚ": "ㅗㅣ", "ㅝ": "ㅜㅓ", "ㅞ": "ㅜㅔ", "ㅟ": "ㅜㅣ", "ㅢ": "ㅡㅣ",
  "ㄳ": "ㄱㅅ", "ㄵ": "ㄴㅈ", "ㄶ": "ㄴㅎ", "ㄺ": "ㄹㄱ", "ㄻ": "ㄹㅁ", "ㄼ": "ㄹㅂ", "ㄽ": "ㄹㅅ",
  "ㄾ": "ㄹㅌ", "ㄿ": "ㄹㅍ", "ㅀ": "ㄹㅎ", "ㅄ": "ㅂㅅ",
};

function jamo(ch) {
  const code = ch.charCodeAt(0) - 0xac00;
  let s = ch;
  if (code >= 0 && code < 11172) {
    s = CHO[Math.floor(code / 588)] + JUNG[Math.floor((code % 588) / 28)] + JONG[code % 28];
  }
  return [...s].map((x) => SPLIT[x] || x).join("");
}
const keyCount = (word) => [...word].reduce((n, ch) => n + jamo(ch).length, 0);

function judge(typed, target) {
  const t = [...typed];
  const g = [...target];
  return t.map((ch, i) => {
    if (i >= g.length) return "bad";
    if (ch === g[i]) return "ok";
    if (i === t.length - 1) {
      const nextCho = g[i + 1] ? jamo(g[i + 1])[0] : "";
      if ((jamo(g[i]) + nextCho).startsWith(jamo(ch))) return "composing";
    }
    return "bad";
  });
}

const BEST_KEY = "poke-typing-best";
function loadBest() {
  try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch { return {}; }
}
function saveBest(b) {
  try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch {}
}
const bestKeyOf = (m, l) => (m === "attack" ? `attack-${l}` : "challenge");

const $ = (id) => document.getElementById(id);
const pages = ["mainPage", "gamePage", "resultPage"];
function showPage(id) {
  pages.forEach((p) => $(p).classList.toggle("active", p === id));
}

const input = $("typeInput");
const timerEl = $("timer");
const timerBar = $("timerBar");
const timerText = $("timerText");

let mode = "attack";
let level = "normal";

function updateMainTexts() {
  $("levelGroup").style.display = mode === "attack" ? "" : "none";

  document.querySelectorAll("#levelOptions .option").forEach((btn) => {
    btn.querySelector(".lv-desc").textContent = `30초 안에 ${LEVELS[btn.dataset.level].goal}개`;
  });

  $("ruleText").innerHTML = mode === "attack"
    ? `<b>30초</b> 안에 포켓몬 이름 <b>${LEVELS[level].goal}개</b>를 모두 입력하면 성공!`
    : `<b>30초</b> 동안 포켓몬 이름을 최대한 많이 입력하세요!`;

  const best = loadBest()[bestKeyOf(mode, level)];
  $("bestText").innerHTML = best === undefined
    ? "아직 기록이 없어요"
    : mode === "attack"
      ? `최고 기록: <b>${best.toFixed(1)}초</b> 남기고 성공`
      : `최고 기록: <b>${best}개</b>`;
}

function bindOptions(groupId, key, setter) {
  document.querySelectorAll(`#${groupId} .option`).forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(`#${groupId} .option`).forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      setter(btn.dataset[key]);
      updateMainTexts();
    });
  });
}
bindOptions("modeOptions", "mode", (v) => (mode = v));
bindOptions("levelOptions", "level", (v) => (level = v));

let game = null;
let rafId = 0;
let countdownTimers = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  stopGame();
  game = {
    mode,
    level: mode === "attack" ? level : null,
    goal: mode === "attack" ? LEVELS[level].goal : null,
    queue: shuffle(NAMES),
    index: 0,
    done: 0,
    submits: 0,
    correct: 0,
    keys: 0,
    startAt: 0,
    remaining: GAME_TIME,
    running: false,
  };

  showPage("gamePage");
  $("modeLabel").textContent = modeLabelOf(game);
  setTimerVisual(GAME_TIME);
  renderProgress();
  showTarget();
  input.value = "";
  renderTyped();
  setMessage("이름을 입력하고 <b>Enter</b>를 누르세요");
  input.focus();
  runCountdown();
}

const modeLabelOf = (g) =>
  g.mode === "attack" ? `${MODES.attack.label} · ${LEVELS[g.level].label}` : MODES.challenge.label;

function runCountdown() {
  const box = $("countdown");
  box.classList.add("show");
  ["3", "2", "1", "시작!"].forEach((txt, i) => {
    countdownTimers.push(setTimeout(() => { box.textContent = txt; }, i * 800));
  });
  countdownTimers.push(setTimeout(() => {
    box.classList.remove("show");
    box.textContent = "";
    input.value = "";
    renderTyped();
    input.focus();
    game.running = true;
    game.startAt = performance.now();
    rafId = requestAnimationFrame(tick);
  }, 4 * 800 - 200));
}

function stopGame() {
  cancelAnimationFrame(rafId);
  countdownTimers.forEach(clearTimeout);
  countdownTimers = [];
  $("countdown").classList.remove("show");
  if (game) game.running = false;
  setDanger("");
}

function tick(now) {
  if (!game || !game.running) return;
  const elapsed = (now - game.startAt) / 1000;
  game.remaining = Math.max(0, GAME_TIME - elapsed);
  setTimerVisual(game.remaining);

  if (game.remaining <= 0) {
    finishGame(false);
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function setTimerVisual(sec) {
  timerBar.style.width = `${(sec / GAME_TIME) * 100}%`;
  timerText.textContent = sec.toFixed(1);

  let state = "";
  if (sec <= 3) state = "critical";
  else if (sec <= 5) state = "danger";
  else if (sec <= 10) state = "warn";
  setDanger(game && game.running ? state : "");
}

function setDanger(state) {
  timerEl.classList.toggle("warn", state === "warn");
  timerEl.classList.toggle("danger", state === "danger" || state === "critical");
  timerEl.classList.toggle("critical", state === "critical");
}

function currentName() { return game.queue[game.index % game.queue.length]; }
function nextNameOf() { return game.queue[(game.index + 1) % game.queue.length]; }

function showTarget() {
  $("targetName").textContent = currentName();
  const isLast = game.mode === "attack" && game.done === game.goal - 1;
  $("nextName").textContent = isLast ? "마지막 문제!" : `다음: ${nextNameOf()}`;
}

function renderProgress() {
  $("progressText").innerHTML = game.mode === "attack"
    ? `${game.done} <small>/ ${game.goal}</small>`
    : `${game.done}개`;
}

function renderTyped() {
  const typed = input.value;
  const target = game ? currentName() : "";
  const states = judge(typed, target);
  $("typedText").innerHTML = [...typed]
    .map((ch, i) => `<span class="ch ${states[i]}">${ch === " " ? "&nbsp;" : ch}</span>`)
    .join("");
  $("typedBox").classList.remove("wrong", "right");
}

function setMessage(html, cls = "") {
  const m = $("message");
  m.className = `message ${cls}`;
  m.innerHTML = html;
}

input.addEventListener("input", () => {
  if (!game) return;
  renderTyped();
});

let submitLock = false;
input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (submitLock) return;
  submitLock = true;
  setTimeout(() => {
    submitLock = false;
    submit();
  }, 0);
});

function submit() {
  if (!game || !game.running) return;
  const typed = input.value.trim();
  if (!typed) return;

  const target = currentName();
  game.submits++;

  if (typed === target) {
    game.correct++;
    game.done++;
    game.keys += keyCount(target);
    game.index++;

    $("typedBox").classList.add("right");
    setMessage("정답!", "right");
    input.value = "";

    if (game.mode === "attack" && game.done >= game.goal) {
      renderProgress();
      finishGame(true);
      return;
    }
    renderProgress();
    showTarget();
    setTimeout(() => {
      if (game && game.running && !input.value) {
        renderTyped();
        setMessage("이름을 입력하고 <b>Enter</b>를 누르세요");
      }
    }, 350);
  } else {
    renderTyped();
    const box = $("typedBox");
    box.classList.remove("wrong");
    void box.offsetWidth;
    box.classList.add("wrong");
    setMessage("틀렸어요! <b>빨간 글자</b>를 고친 뒤 다시 Enter를 누르세요", "wrong");
  }
}

$("gamePage").addEventListener("mousedown", (e) => {
  e.preventDefault();
  input.focus();
});
input.addEventListener("focus", () => $("typedBox").classList.add("focus"));
input.addEventListener("blur", () => {
  $("typedBox").classList.remove("focus");
  if (game && $("gamePage").classList.contains("active")) setTimeout(() => input.focus(), 0);
});

function finishGame(cleared) {
  const g = game;
  stopGame();
  setTimerVisual(g.remaining);

  const used = GAME_TIME - g.remaining;
  const speed = used > 0 ? Math.round((g.keys / used) * 60) : 0;
  const acc = g.submits ? Math.round((g.correct / g.submits) * 100) : 0;
  const key = bestKeyOf(g.mode, g.level);
  const bests = loadBest();
  const prevBest = bests[key];
  let newRecord = false;

  $("resultMode").textContent = modeLabelOf(g);
  const title = $("resultTitle");

  if (g.mode === "attack") {
    if (cleared) {
      title.textContent = "성공!";
      title.className = "result-title";
      $("resultSub").textContent = `${g.remaining.toFixed(1)}초를 남기고 ${g.goal}개를 모두 입력했어요`;
      if (prevBest === undefined || g.remaining > prevBest) {
        bests[key] = g.remaining;
        newRecord = true;
      }
    } else {
      title.textContent = "시간 초과";
      title.className = "result-title fail";
      $("resultSub").textContent = `${g.goal}개 중 ${g.done}개 입력 · ${g.goal - g.done}개가 부족했어요`;
    }
    $("statTimeLabel").textContent = "남은 시간";
    $("statTime").textContent = `${g.remaining.toFixed(1)}초`;
  } else {
    title.textContent = `${g.done}개`;
    title.className = "result-title";
    $("resultSub").textContent = "30초 동안 입력한 포켓몬 이름 개수";
    if (g.done > 0 && (prevBest === undefined || g.done > prevBest)) {
      bests[key] = g.done;
      newRecord = true;
    }
    $("statTimeLabel").textContent = "최고 기록";
    $("statTime").textContent = `${newRecord ? g.done : prevBest ?? 0}개`;
  }

  if (newRecord) saveBest(bests);

  $("statCount").textContent = g.done;
  $("statSpeed").textContent = `${speed}타`;
  $("statAcc").textContent = `${acc}%`;
  $("resultBest").innerHTML = newRecord
    ? "<b>최고 기록 갱신!</b>"
    : g.mode === "attack" && bests[key] !== undefined
      ? `최고 기록: <b>${bests[key].toFixed(1)}초</b> 남기고 성공`
      : "";

  input.blur();
  game = null;
  showPage("resultPage");
}

function goHome() {
  stopGame();
  game = null;
  input.blur();
  updateMainTexts();
  showPage("mainPage");
}

$("logo").addEventListener("click", (e) => {
  e.preventDefault();
  goHome();
});
$("startBtn").addEventListener("click", startGame);
$("retryBtn").addEventListener("click", startGame);
$("homeBtn").addEventListener("click", goHome);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.target === input) return;
  if ($("mainPage").classList.contains("active") || $("resultPage").classList.contains("active")) {
    e.preventDefault();
    startGame();
  }
});

updateMainTexts();