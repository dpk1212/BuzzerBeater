let currentGame = 1;
let shotsLeft = 12;
let score = 0;
let streak = 0;
let isDirectionShown = false;
let shotStartTime;
let currentWindow;
let requiredDirection;
let hasPressed = false;
let playerSeed;
let reactionTimes = [];

const directions = ['↑', '↓', '←', '→'];
const keyMap = {
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→'
};

const baseScenarios = [
  { text: "Open layup to win!", points: 1, baseWindow: 900 },
  { text: "Mid-range jumper with a defender!", points: 2, baseWindow: 700 },
  { text: "Deep three to beat the buzzer!", points: 3, baseWindow: 500 }
];

function getScenarios(seed) {
  const difficultyFactor = (seed - 1) / 15; // 0 (Seed 1) to 1 (Seed 16)
  return baseScenarios.map(scenario => ({
    ...scenario,
    window: Math.round(scenario.baseWindow * (1 - difficultyFactor * 0.5)),
    weight: scenario.points === 1 ? (1 - difficultyFactor) :
            scenario.points === 2 ? 1 :
            difficultyFactor
  }));
}

function startGame() {
  playerSeed = parseInt(document.getElementById("seedSelect").value);
  const scenarios = getScenarios(playerSeed);

  document.getElementById("landingPage").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  document.getElementById("reactionTracker").style.display = "block";
  document.getElementById("seedDisplay").textContent = playerSeed;

  updateStats();
  nextShot(scenarios);
}

function nextShot(scenarios) {
  if (shotsLeft <= 0) {
    if (currentGame < 6) {
      currentGame++;
      shotsLeft = 12;
      reactionTimes = []; // Reset reaction times for new game
      document.getElementById("reactionList").innerHTML = "";
      updateStats();
    } else {
      endGame(true); // Win condition
      return;
    }
  }

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
  let clock = Math.floor(Math.random() * 4) + 3;
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

  let attemptResult;
  if (pressedKey === requiredDirection && reactionTime <= currentWindow) {
    score += scenario.points;
    streak++;
    resultEl.textContent = "Made it!";
    resultEl.style.color = "green";
    attemptResult = `${reactionTime}ms`;
  } else {
    resultEl.textContent = pressedKey !== requiredDirection ? "Missed! (Wrong direction)" : "Missed! (Too late)";
    resultEl.style.color = "red";
    streak = 0;
    attemptResult = "Miss";
  }

  // Log reaction time
  reactionTimes.push({ attempt: 13 - shotsLeft, result: attemptResult });
  updateReactionTracker();

  shotsLeft--;
  updateStats();
  setTimeout(() => {
    document.getElementById("direction").style.display = "none";
    resultEl.textContent = "";
    nextShot(scenarios);
  }, 500);
}

function updateStats() {
  document.getElementById("gameNumber").textContent = currentGame;
  document.getElementById("shotsLeft").textContent = shotsLeft;
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
}

function updateReactionTracker() {
  const reactionList = document.getElementById("reactionList");
  reactionList.innerHTML = "";
  reactionTimes.forEach(({ attempt, result }) => {
    const li = document.createElement("li");
    li.textContent = `Shot ${attempt}: ${result}`;
    reactionList.appendChild(li);
  });
}

function endGame(won = false) {
  document.removeEventListener("keydown", handleKeyPress);
  document.getElementById("scenario").textContent = won ?
    `Champion! Seed ${playerSeed} - Score: ${score}, Longest Streak: ${streak}` :
    `Game Over! Seed ${playerSeed} - Reached Game ${currentGame}, Score: ${score}`;
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyPress);
