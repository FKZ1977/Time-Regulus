const currentVersion = "1.5.0";
let lastError = null;
let hasCalculated = false;
let reverseMode = "toStandard";
let hasCalculatedError = false;
let resultHistory = [];

function checkPass() {
  const inputField = document.getElementById("passcode");
  const input = inputField.value;
  const correct = "164";
  const errorMessage = document.getElementById("error");

  if (input === correct) {
    document.getElementById("lockScreen").style.display = "none";
    document.getElementById("modeSelect").style.display = "block";
    inputField.blur();
    inputField.style.border = "";
    errorMessage.innerText = "";
  } else {
    errorMessage.innerText = "暗証番号が違います";
    inputField.style.border = "2px solid red";
    inputField.value = "";
    inputField.focus();
    generateKeypad();
  }
}

function generateKeypad() {
  const keypad = document.getElementById("keypad");
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const shuffled = numbers.sort(() => Math.random() - 0.5);
  keypad.innerHTML = "";

  shuffled.forEach(num => {
    const btn = document.createElement("button");
    btn.innerText = num;
    btn.onclick = () => {
      const input = document.getElementById("passcode");
      input.value += num;
    };
    keypad.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("lastVersion") !== currentVersion) {
    alert("Time Regulusが更新されました！");
    localStorage.setItem("lastVersion", currentVersion);
  }

  const passInput = document.getElementById("passcode");
  if (passInput) {
    passInput.focus();
    passInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        checkPass();
      }
    });
  }

  generateKeypad();

  populateSeconds("standardSeconds");
  populateSeconds("displaySeconds");
  populateSeconds("reverseDisplaySeconds");
  populateErrorDropdowns();

  const reverseInputs = [
    "errorDays", "errorHours", "errorMinutes", "errorSeconds",
    "errorDirection", "reverseDisplayTime", "reverseDisplaySeconds"
  ];
  reverseInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", handleReverseCalculation);
      el.addEventListener("change", handleReverseCalculation);
    }
  });

  document.getElementById("standardTime").addEventListener("input", () => {
    if (hasCalculatedError) calculateError();
  });
  document.getElementById("displayTime").addEventListener("input", () => {
    if (hasCalculatedError) calculateError();
  });
  document.getElementById("standardSeconds").addEventListener("change", () => {
    if (hasCalculatedError) calculateError();
  });
  document.getElementById("displaySeconds").addEventListener("change", () => {
    if (hasCalculatedError) calculateError();
  });
});

function populateSeconds(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "秒";
  select.appendChild(defaultOption);

  for (let i = 0; i <= 59; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i.toString().padStart(2, '0');
    select.appendChild(option);
  }
}

function populateErrorDropdowns() {
  const hourSelect = document.getElementById("errorHours");
  const minuteSelect = document.getElementById("errorMinutes");
  const secondSelect = document.getElementById("errorSeconds");

  for (let i = 0; i <= 23; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i}`;
    hourSelect.appendChild(option);
  }

  for (let i = 0; i <= 59; i++) {
    const minOpt = document.createElement("option");
    minOpt.value = i;
    minOpt.text = `${i}`;
    minuteSelect.appendChild(minOpt);

    const secOpt = document.createElement("option");
    secOpt.value = i;
    secOpt.text = `${i}`;
    secondSelect.appendChild(secOpt);
  }
}

function setNowToStandard() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = now.getSeconds();

  const datetimeLocal = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  document.getElementById("standardTime").value = datetimeLocal;
  document.getElementById("standardSeconds").value = sec;

  calculateError();
}

function showErrorMode() {
  document.getElementById("modeSelect").style.display = "none";
  document.getElementById("errorMode").style.display = "block";
}

function showCorrectionMode() {
  document.getElementById("modeSelect").style.display = "none";
  document.getElementById("correctionMode").style.display = "block";
}

function backToModeSelect() {
  document.getElementById("errorMode").style.display = "none";
  document.getElementById("correctionMode").style.display = "none";
  document.getElementById("resultListPage").style.display = "none";
  document.getElementById("modeSelect").style.display = "block";
}

function backToCorrectionMode() {
  document.getElementById("resultListPage").style.display = "none";
  document.getElementById("correctionMode").style.display = "block";
}

function calculateError() {
  hasCalculatedError = true;

  const standardInput = document.getElementById("standardTime").value;
  const displayInput = document.getElementById("displayTime").value;
  const standardSec = Number(document.getElementById("standardSeconds").value || 0);
  const displaySec = Number(document.getElementById("displaySeconds").value || 0);

  if (!standardInput || !displayInput) {
    document.getElementById("result").innerText = "両方の時刻を入力してください";
    return;
  }

  const standard = new Date(standardInput);
  const display = new Date(displayInput);
  standard.setSeconds(standardSec);
  display.setSeconds(displaySec);

  const diffMs = Math.abs(standard - display);
  const isFast = display < standard;

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const resultElement = document.getElementById("result");

  if (totalSeconds === 0) {
    resultElement.innerHTML = `
      <span style="color: var(--accent); font-weight: bold;">Perfect Sync!</span><br>
      <span style="color: var(--text-sub); font-size: 15px;">表示時刻は標準時刻と完全に一致しています。</span>
    `;
    return;
  }

  const parts = [];
  if (days > 0) parts.push(`${days}日`);
  if (hours > 0) parts.push(`${hours}時間`);
  if (minutes > 0) parts.push(`${minutes}分`);
  if (seconds > 0) parts.push(`${seconds}秒`);

  const direction = isFast ? "遅れています。" : "進んでいます。";

  resultElement.innerHTML = `
    <span style="color: var(--accent); font-weight: bold;">${parts.join("")}</span><br>
    <span style="color: var(--text-sub);">${direction}</span>
  `;

  lastError = { days, hours, minutes, seconds, isFast };
  document.getElementById("toReverseButton").style.display = "block";
}

function applyLastErrorToReverseInputs() {
  if (!lastError) return;
  document.getElementById("errorDays").value    = lastError.days    || 0;
  document.getElementById("errorHours").value   = lastError.hours   || 0;
  document.getElementById("errorMinutes").value = lastError.minutes || 0;
  document.getElementById("errorSeconds").value = lastError.seconds || 0;
  document.getElementById("errorDirection").value = lastError.isFast ? "early" : "late";
  reverseCalculate();
}

function switchToCorrectionMode() {
  document.getElementById("errorMode").style.display = "none";
  document.getElementById("correctionMode").style.display = "block";

  const prevSeconds = document.getElementById("reverseDisplaySeconds").value;
  populateSeconds("reverseDisplaySeconds");
  if (prevSeconds !== "" && prevSeconds !== "秒" && prevSeconds !== "--") {
    document.getElementById("reverseDisplaySeconds").value = prevSeconds;
  }

  applyLastErrorToReverseInputs();
  reverseMode = "toStandard";
  handleReverseCalculation();
}

function toggleReverseMode() {
  reverseMode = reverseMode === "toStandard" ? "toDisplay" : "toStandard";

  const label = document.getElementById("reverseTimeLabel");
  const toggleBtn = document.querySelector(".toggle-btn");

  if (reverseMode === "toDisplay") {
    label.innerText = "探している時刻:";
    toggleBtn.classList.add("active-toggle");
  } else {
    label.innerText = "表示時刻:";
    toggleBtn.classList.remove("active-toggle");
  }

  handleReverseCalculation();
}

function handleReverseCalculation() {
  const resultElement = document.getElementById("reverseResult");
  resultElement.innerHTML = "";

  const days    = Number(document.getElementById("errorDays").value || 0);
  const hours   = Number(document.getElementById("errorHours").value || 0);
  const minutes = Number(document.getElementById("errorMinutes").value || 0);
  const seconds = Number(document.getElementById("errorSeconds").value || 0);
  const direction = document.getElementById("errorDirection").value;

  const timeInput = document.getElementById("reverseDisplayTime").value;
  const timeSec   = document.getElementById("reverseDisplaySeconds").value;

  const hasError = (days + hours + minutes + seconds) > 0;
  const hasTime = timeInput && timeSec !== "" && timeSec !== "秒" && timeSec !== "--";

  if (!hasError && !hasTime) {
    resultElement.innerText = "両方の時刻を入力してください";
    return;
  }

  if (!hasTime && hasError) {
    resultElement.innerText = reverseMode === "toDisplay"
      ? "探している時刻を入力してください"
      : "表示時刻を入力してください";
    return;
  }

  if (hasTime && !hasError) {
    resultElement.innerText = "補正に使う誤差を入力してください";
    return;
  }

  const baseTime = new Date(timeInput);
  baseTime.setSeconds(Number(timeSec));

  const totalMs = ((days * 86400) + (hours * 3600) + (minutes * 60) + seconds) * 1000;
  const isLate = direction === "late";

  const resultTime = new Date(
    reverseMode === "toDisplay"
      ? baseTime.getTime() + (isLate ? totalMs : -totalMs)
      : baseTime.getTime() + (isLate ? -totalMs : totalMs)
  );

  const y = resultTime.getFullYear();
  const m = String(resultTime.getMonth() + 1).padStart(2, '0');
  const d = String(resultTime.getDate()).padStart(2, '0');
  const h = String(resultTime.getHours()).padStart(2, '0');
  const min = String(resultTime.getMinutes()).padStart(2, '0');
  const s = String(resultTime.getSeconds()).padStart(2, '0');

  const color = reverseMode === "toDisplay" ? "#fff" : "var(--accent)";
  const label = reverseMode === "toDisplay" ? "表示時刻です" : "補正時刻です";

  resultElement.innerHTML = `
    <p style="color: ${color}; font-weight: bold;">
      ${y}年${m}月${d}日 ${h}時${min}分${s}秒
    </p>
    <p style="color: var(--text-sub);">が${label}</p>
  `;

  document.getElementById("addToListButton").style.display = "inline-block";
  document.getElementById("showListLink").style.display = "block";

  const result = {
    error: { days, hours, minutes, seconds, direction },
    mode: reverseMode,
    base: baseTime,
    result: resultTime
  };
  window.latestResult = result;
}

function addResultToList() {
  const r = window.latestResult;
  if (!r) return;

  const key = `${r.error.days}-${r.error.hours}-${r.error.minutes}-${r.error.seconds}-${r.error.direction}`;
  const group = resultHistory.find(g => g.key === key);
  const baseStr = r.base.toISOString();
  const resultStr = r.result.toISOString();

  if (group) {
    const exists = group.entries.some(e => e.base.toISOString() === baseStr && e.result.toISOString() === resultStr && e.mode === r.mode);
    if (!exists) group.entries.push({ base: r.base, result: r.result, mode: r.mode });
  } else {
    resultHistory.push({
      key,
      error: r.error,
      entries: [{ base: r.base, result: r.result, mode: r.mode }]
    });
  }

  renderResultList();
}

function showResultList() {
  document.getElementById("correctionMode").style.display = "none";
  document.getElementById("resultListPage").style.display = "block";
  renderResultList();
}

function renderResultList() {
  const container = document.getElementById("resultListContainer");
  container.innerHTML = "";

  resultHistory.forEach(group => {
    const { days, hours, minutes, seconds, direction } = group.error;
    const errorText = `${days || 0}日${hours || 0}時間${minutes || 0}分${seconds || 0}秒（${direction === "late" ? "進み" : "遅れ" }）`;

    const modes = { toStandard: [], toDisplay: [] };
    group.entries.forEach(e => modes[e.mode].push(e));

    ["toStandard", "toDisplay"].forEach(mode => {
      if (modes[mode].length === 0) return;

      const box = document.createElement("div");
      box.className = "result-box";
      box.style.backgroundColor = mode === "toStandard" ? "rgba(0,255,224,0.1)" : "rgba(255,0,170,0.1)";
      box.style.borderRadius = "12px";
      box.style.padding = "16px";
      box.style.marginBottom = "24px";
      box.style.boxShadow = "0 0 6px rgba(0,0,0,0.2)";
      box.style.textAlign = "left";

      const title = document.createElement("div");
      title.innerHTML = `<strong>補正に使った誤差：</strong>${errorText}<br><strong>${mode === "toStandard" ? "表示時刻 → 補正時刻" : "探している時刻 → 表示時刻"}</strong>`;
      title.style.marginBottom = "12px";
      box.appendChild(title);

      modes[mode].forEach((entry, idx) => {
        const line = document.createElement("div");
        const base = formatDate(entry.base);
        const result = formatDate(entry.result);
        line.innerHTML = `${base} → ${result} <button onclick="deleteResult('${group.key}', ${idx}, '${mode}')">削除</button>`;
        line.style.marginBottom = "6px";
        box.appendChild(line);
      });

      container.appendChild(box);
    });
  });
}

function deleteResult(key, index, mode) {
  const group = resultHistory.find(g => g.key === key);
  if (!group) return;
  group.entries = group.entries.filter((e, i) => !(i === index && e.mode === mode));
  renderResultList();
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}:${s}`;
}

function showInformationPage() {
  document.getElementById("lockScreen").style.display = "none";
  document.getElementById("informationPage").style.display = "block";
}

function backToLockScreen() {
  document.getElementById("informationPage").style.display = "none";
  document.getElementById("lockScreen").style.display = "block";
}