let timeLeft = 60;
let score = 0;
let streak = 0;
let isDirectionShown = false;
let shotStartTime;
let currentWindow;
let requiredDirection;
let hasPressed = false;

const directions = ['↑', '↓', '←', '→'];
const keyMap = {
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→'
};

const scenarios = [
  { text: "Open layup to win!", points: 1, window: 700 }, // Easy
  { text: "Mid-range jumper with a defender!", points: 2, window: 500 }, // Medium
  { text: "Deep three to beat the buzzer!", points: 3, window: 300 } // Hard
];

function startGame() {
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
  let clock = Math.floor(Math.random() * 4) + 3; // 3-6s countdown
  document.getElementById("scenario").textContent = `${scenario.text} ${clock}...`;
  isDirectionShown = false;
  hasPressed = false;
  const countdown = setInterval(() => {
    clock--;
    if (clock > 0) {
      document.getElementById("scenario").textContent = `${scenario.text} ${clock}...`;
    } else {
      clearInterval(countdown);
      document.getElementById("scenario").textContent = scenario.text;
      requiredDirection = directions[Math.floor(Math.random() * directions.length)];
      document.getElementById("direction").textContent = requiredDirection;
      document.getElementById("direction").style.display = "block";
      isDirectionShown = true;
      shotStartTime = Date.now();
    }
  }, 1000);
}

function handleKeyPress(event) {
  if (!isDirectionShown || hasPressed) return;
  hasPressed = true;
  const pressedKey = keyMap[event.key];
  const resultEl = document.getElementById("result");
  const reactionTime = Date.now() - shotStartTime;
  if (pressedKey === requiredDirection && reactionTime <= currentWindow) {
    score += scenarios.find(s => s.text === document.getElementById("scenario").textContent).points;
    streak++;
    resultEl.textContent = "Made it!";
    resultEl.style.color = "green";
  } else if (pressedKey !== requiredDirection) {
    resultEl.textContent = "Missed! (Wrong direction)";
    resultEl.style.color = "red";
    streak = 0;
  } else {
    resultEl.textContent = "Missed! (Too late)";
    resultEl.style.color = "red";
    streak = 0;
  }
  updateStats();
  setTimeout(() => {
    document.getElementById("direction").style.display = "none";
    resultEl.textContent = "";
    nextShot();
  }, 500);
}

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
}

function endGame() {
  document.removeEventListener("keydown", handleKeyPress);
  document.getElementById("scenario").textContent = `Game Over! Score: ${score}, Longest Streak: ${streak}`;
}

document.addEventListener("keydown", handleKeyPress);
document.getElementById("startBtn").addEventListener("click", startGame);;
