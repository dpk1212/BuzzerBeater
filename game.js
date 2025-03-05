let timeLeft = 60;
let score = 0;
let streak = 0;
let isDirectionShown = false;
let shotStartTime;
let currentWindow;
let requiredDirection;
let hasPressed = false;
let playerSeed;

const directions = ['↑', '↓', '←', '→'];
const keyMap = {
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→'
};

// Adjust difficulty based on seed (1 = easiest, 16 = hardest)
const baseScenarios = [
  { text: "Open layup to win!", points: 1, baseWindow: 900 }, // Easy
  { text: "Mid-range jumper with a defender!", points: 2, baseWindow: 700 }, // Medium
  { text: "Deep three to beat the buzzer!", points: 3, baseWindow: 500 } // Hard
];

// Function to adjust scenarios based on seed
function getScenarios(seed) {
  const difficultyFactor = (seed - 1) / 15; // 0 (Seed 1) to 1 (Seed 16)
  return baseScenarios.map(scenario => ({
    ...scenario,
    window: Math.round(scenario.baseWindow * (1 - difficultyFactor * 0.5)), // Reduce window as seed increases
    weight: scenario.points === 1 ? (1 - difficultyFactor) : // More easy shots for low seeds
            scenario.points === 2 ? 1 :
            difficultyFactor // More hard shots for high seeds
  }));
}

function startGame() {
  // Get selected seed
  playerSeed = parseInt(document.getElementById("seedSelect").value);
  const scenarios = getScenarios(playerSeed);

  // Hide landing page, show game screen
  document.getElementById("landingPage").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  document.getElementById("seedDisplay").textContent = playerSeed;

  // Start the timer
  setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft;
    } else {
      endGame();
    }
  }, 1000);

  nextShot(scenarios);
}

function nextShot(scenarios) {
  if (timeLeft <= 0) return;

  // Weighted random selection based on difficulty
  const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
  let r = Math.random() * totalWeight;
  let scenario;
  for (let i = 0; i < scenarios.length; i++) {
    r -= scenarios[i].weight;
    if (r <= 0) {
      scenario = scenarios[i];
      break;
    }
  }

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
  const currentScenarioText = document.getElementById("scenario").textContent;
  const scenarios = getScenarios(playerSeed);
  const scenario = scenarios.find(s => s.text === currentScenarioText);

  if (pressedKey === requiredDirection && reactionTime <= currentWindow) {
    score += scenario.points;
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
    nextShot(scenarios);
  }, 500);
}

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
}

function endGame() {
  document.removeEventListener("keydown", handleKeyPress);
  document.getElementById("scenario").textContent = `Game Over! Seed ${playerSeed} - Score: ${score}, Longest Streak: ${streak}`;
}

// Event listener for start button
document.getElementById("startBtn").addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyPress);
