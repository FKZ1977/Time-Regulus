let lastError = null;
let hasCalculated = false;

// 🔐 パスワード認証処理
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
  }
}

// ⌨️ 起動時の初期処理
document.addEventListener("DOMContentLoaded", function () {
  const passInput = document.getElementById("passcode");
  if (passInput) {
    passInput.focus();
    passInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        checkPass();
      }
    });
  }

  populateSeconds("standardSeconds");
  populateSeconds("displaySeconds");
  populateSeconds("reverseDisplaySeconds");

  document.getElementById("reverseDisplayTime").addEventListener("input", function () {
    if (hasCalculated) reverseCalculate();
  });
  document.getElementById("reverseDisplaySeconds").addEventListener("change", function () {
    if (hasCalculated) reverseCalculate();
  });
});

// ⏱️ 秒セレクト生成
function populateSeconds(selectId) {
  const select = document.getElementById(selectId);
  if (!select || select.options.length > 1) return;
  for (let i = 0; i <= 59; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${String(i).padStart(2, '0')}秒`;
    select.appendChild(option);
  }
}

// 🔁 モード切り替え
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

// 🧮 誤差計算ロジック
function calculateError() {
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

// 🔁 誤差を補正モードに反映
function applyLastErrorToReverseInputs() {
  if (!lastError) return;
  document.getElementById("errorDays").value    = lastError.days    || 0;
  document.getElementById("errorHours").value   = lastError.hours   || 0;
  document.getElementById("errorMinutes").value = lastError.minutes || 0;
  document.getElementById("errorSeconds").value = lastError.seconds || 0;
  document.getElementById("errorDirection").value = lastError.isFast ? "early" : "late";
  reverseCalculate();
}

// 🔁 誤差計算後に補正モードへ切り替える
function switchToCorrectionMode() {
  document.getElementById("errorMode").style.display = "none";
  document.getElementById("correctionMode").style.display = "block";
  populateSeconds("reverseDisplaySeconds");
  applyLastErrorToReverseInputs();
}

// 🔁 補正ロジック：誤差と表示時刻から標準時刻を逆算
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

  resultElement.innerHTML = `
    <p style="color: var(--accent); font-weight: bold;">${cy}年${cm}月${cd}日 ${ch}時${cmin}分${cs}秒</p>
    <p style="color: var(--text-sub);">が補正時刻です</p>
  `;
}