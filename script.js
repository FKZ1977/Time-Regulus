const currentVersion = "1.3.0";
let lastError = null;
let hasCalculated = false;
let reverseMode = "toStandard";
let hasCalculatedError = false;

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
    inputField.value = ""; // ✅ 入力欄を空にする
    generateKeypad();       // ✅ テンキーを再シャッフル
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

  document.getElementById("reverseDisplayTime").addEventListener("input", function () {
    if (hasCalculated) reverseCalculate();
  });
  document.getElementById("reverseDisplaySeconds").addEventListener("change", function () {
    if (hasCalculated) reverseCalculate();
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
  if (!select || select.options.length > 1) return;
  for (let i = 0; i <= 59; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i}`;
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
  document.getElementById("modeSelect").style.display = "block";
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
  populateSeconds("reverseDisplaySeconds");
  applyLastErrorToReverseInputs();
}

function reverseCalculate() {
  hasCalculated = true;
  const resultElement = document.getElementById("reverseResult");

  const days    = Number(document.getElementById("errorDays").value || 0);
  const hours   = Number(document.getElementById("errorHours").value || 0);
  const minutes = Number(document.getElementById("errorMinutes").value || 0);
  const seconds = Number(document.getElementById("errorSeconds").value || 0);
  const isLate  = document.getElementById("errorDirection").value === "late";

  const displayInput = document.getElementById("reverseDisplayTime").value;
  const displaySec   = Number(document.getElementById("reverseDisplaySeconds").value || 0);
  if (!displayInput) {
    resultElement.innerText = "表示時刻を入力してください";
    return;
  }

  const displayTime = new Date(displayInput);
  displayTime.setSeconds(displaySec);

  const totalMs = ((days * 86400) + (hours * 3600) + (minutes * 60) + seconds) * 1000;
  const correctedTime = new Date(displayTime.getTime() + (isLate ? -totalMs : totalMs));

  const cy   = correctedTime.getFullYear();
  const cm   = String(correctedTime.getMonth() + 1).padStart(2, '0');
  const cd   = String(correctedTime.getDate()).padStart(2, '0');
  const ch   = String(correctedTime.getHours()).padStart(2, '0');
  const cmin = String(correctedTime.getMinutes()).padStart(2, '0');
  const cs   = String(correctedTime.getSeconds()).padStart(2, '0');

  const color = reverseMode === "toDisplay" ? "var(--toggle-bg)" : "var(--accent)";

  resultElement.innerHTML = `
    <p style="color: ${color}; font-weight: bold;">
      ${cy}年${cm}月${cd}日 ${ch}時${cmin}分${cs}秒
    </p>
    <p style="color: var(--text-sub);">が補正時刻です</p>
  `;
}

function calculateDisplayTime() {
  const resultElement = document.getElementById("reverseResult");

  const days    = Number(document.getElementById("errorDays").value || 0);
  const hours   = Number(document.getElementById("errorHours").value || 0);
  const minutes = Number(document.getElementById("errorMinutes").value || 0);
  const seconds = Number(document.getElementById("errorSeconds").value || 0);
  const isLate  = document.getElementById("errorDirection").value === "late";

  const targetInput = document.getElementById("reverseDisplayTime").value;
  const targetSec   = Number(document.getElementById("reverseDisplaySeconds").value || 0);
  if (!targetInput) {
    resultElement.innerText = "探している時刻を入力してください";
    return;
  }

  const targetTime = new Date(targetInput);
  targetTime.setSeconds(targetSec);

  const totalMs = ((days * 86400) + (hours * 3600) + (minutes * 60) + seconds) * 1000;
  const displayTime = new Date(targetTime.getTime() + (isLate ? totalMs : -totalMs));

  const dy   = displayTime.getFullYear();
  const dm   = String(displayTime.getMonth() + 1).padStart(2, '0');
  const dd   = String(displayTime.getDate()).padStart(2, '0');
  const dh   = String(displayTime.getHours()).padStart(2, '0');
  const dmin = String(displayTime.getMinutes()).padStart(2, '0');
  const ds   = String(displayTime.getSeconds()).padStart(2, '0');

const color = reverseMode === "toDisplay" ? "#fff" : "var(--accent)";

  resultElement.innerHTML = `
    <p style="color: ${color}; font-weight: bold;">
      ${dy}年${dm}月${dd}日 ${dh}時${dmin}分${ds}秒
    </p>
    <p style="color: var(--text-sub);">が表示時刻です</p>
  `;
}

function toggleReverseMode() {
  reverseMode = reverseMode === "toStandard" ? "toDisplay" : "toStandard";

  const label = document.getElementById("reverseTimeLabel");
  const button = document.getElementById("reverseCalcButton");
  const toggleBtn = document.querySelector(".toggle-btn");

  if (reverseMode === "toDisplay") {
    label.innerText = "探している時刻:";
    button.innerText = "表示時刻を計算";
    button.classList.add("active-toggle");
    toggleBtn.classList.add("active-toggle");
  } else {
    label.innerText = "表示時刻:";
    button.innerText = "補正時刻を計算";
    button.classList.remove("active-toggle");
    toggleBtn.classList.remove("active-toggle");
  }

  handleReverseCalculation();
}

function handleReverseCalculation() {
  if (reverseMode === "toStandard") {
    reverseCalculate();
  } else {
    calculateDisplayTime();
  }
}

// ✅ NOW🔄ボタンの動作（標準時刻に現在時刻をセット）
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

  if (hasCalculatedError) calculateError();
}