// game.js
let timeLeft = 60;
let score = 0;
let streak = 0;
let isShootPrompted = false;
let shotStartTime;
let currentWindow;

const scenarios = [
  { text: "Open layup to win!", points: 1, window: 700 }, // Easy
  { text: "Deep three to beat the buzzer!", points: 3, window: 300 }, // Hard
  // Add all 15 scenarios here
];

function startGame() {
  document.getElementById("shootBtn").disabled = false;
  setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft;
    } else {
      endGame();
    }
  }, 1000);
  nextShot();
}

function nextShot() {
  if (timeLeft <= 0) return;
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  currentWindow = scenario.window;
  let clock = Math.floor(Math.random() * 4) + 3; // 3-6s
  document.getElementById("scenario").textContent = `${scenario.text} ${clock}...`;
  isShootPrompted = false;
  const countdown = setInterval(() => {
    clock--;
    if (clock > 0) {
      document.getElementById("scenario").textContent = `${scenario.text} ${clock}...`;
    } else {
      clearInterval(countdown);
      document.getElementById("scenario").textContent = scenario.text;
      document.getElementById("shootPrompt").style.display = "block";
      isShootPrompted = true;
      shotStartTime = Date.now();
    }
  }, 1000);
}

function shoot() {
  const resultEl = document.getElementById("result");
  if (!isShootPrompted) {
    resultEl.textContent = "Missed! (Too early)";
    resultEl.style.color = "red";
    streak = 0;
  } else {
    const reactionTime = Date.now() - shotStartTime;
    const scenario = scenarios.find(s => s.text === document.getElementById("scenario").textContent);
    if (reactionTime <= scenario.window) {
      score += scenario.points;
      streak++;
      resultEl.textContent = "Made it!";
      resultEl.style.color = "green";
    } else {
      resultEl.textContent = "Missed! (Too late)";
      resultEl.style.color = "red";
      streak = 0;
    }
  }
  updateStats();
  setTimeout(() => {
    document.getElementById("shootPrompt").style.display = "none";
    resultEl.textContent = "";
    nextShot();
  }, 500);
}

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
}

function endGame() {
  document.getElementById("shootBtn").disabled = true;
  document.getElementById("scenario").textContent = `Game Over! Score: ${score}, Longest Streak: ${streak}`;
}

startGame();
