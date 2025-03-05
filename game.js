let currentGame = 0; // 0-based index for rounds array
let shotsLeft = 12;
let playerScore = 0;
let opponentScore = 0;
let streak = 0;
let gameClock = 40 * 60; // 40 minutes in seconds
let isDirectionShown = false;
let shotStartTime;
let currentWindow;
let requiredDirection;
let hasPressed = false;
let playerSeed;
let reactionTimes = [];
let clockInterval;

const rounds = [
  "Round of 64", "Round of 32", "Sweet Sixteen", "Elite Eight", 
  "Final Four", "Semifinals", "Championship"
];

const directions = ['↑', '↓', '←', '→'];
const keyMap = {
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→'
};

const baseScenarios = [
  // Early game (40-20 min)
  { text: "Open layup", points: 1, baseWindow: 900, minTime: 20 * 60 },
  { text: "Mid-range jumper", points: 2, baseWindow: 700, minTime: 20 * 60 },
  // Mid game (20-5 min)
  { text: "Contested mid-range shot", points: 2, baseWindow: 700, minTime: 5 * 60 },
  { text: "Quick three-pointer", points: 3, baseWindow: 500, minTime: 5 * 60 },
  // Clutch (5-0 min)
  { text: "Deep three with time running out", points: 3, baseWindow: 500, minTime: 0 },
  { text: "Buzzer-beater from downtown", points: 3, baseWindow: 500, minTime: 0 }
];

function getScenarios(seed, timeLeft) {
  const difficultyFactor = (seed - 1) / 15;
  return baseScenarios
    .filter(s => timeLeft >= s.minTime)
    .map(scenario => ({
      ...scenario,
      window: Math.round(scenario.baseWindow * (1 - difficultyFactor * 0.5)),
      weight: scenario.points === 1 ? (1 - difficultyFactor) :
              scenario.points === 2 ? 1 :
              difficultyFactor
    }));
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

function startGame() {
  playerSeed = parseInt(document.getElementById("seedSelect").value);
  currentGame = 0;

  const landingPage = document.getElementById("landingPage");
  const gameContainer = document.getElementById("gameContainer");

  landingPage.classList.add("hidden");
  setTimeout(() => {
    landingPage.style.display = "none";
    gameContainer.style.display = "flex";
    document.getElementById("reactionTracker").style.display = "block";
    gameContainer.classList.add("visible");
  }, 500);

  document.getElementById("gameRound").textContent = rounds[currentGame];
  document.getElementById("gameClock").textContent = formatTime(gameClock);
  updateStats();

  clockInterval = setInterval(() => {
    gameClock--;
    document.getElementById("gameClock").textContent = formatTime(gameClock);
    if (gameClock <= 0) {
      clearInterval(clockInterval);
      if (shotsLeft > 0) endGame(false); // Ran out of time
    }
  }, 1000);

  nextShot();
}

function nextShot() {
  const scenarios = getScenarios(playerSeed, gameClock);
  if (shotsLeft <= 0 || gameClock <= 0) {
    if (playerScore > opponentScore) {
      if (currentGame < rounds.length - 1) {
        currentGame++;
        shotsLeft = 12;
        playerScore = 0;
        opponentScore = 0;
        gameClock = 40 * 60;
        reactionTimes = [];
        document.getElementById("reactionList").innerHTML = "";
        document.getElementById("gameRound").textContent = rounds[currentGame];
        document.getElementById("gameClock").textContent = formatTime(gameClock);
        updateStats();
      } else {
        endGame(true);
        return;
      }
    } else {
      endGame(false);
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
  let clock = Math.floor(Math.random() * 2) + 1;
  document.getElementById("scenario").textContent = `${scenario.text} with ${formatTime(gameClock)} left! ${clock}...`;
  isDirectionShown = false;
  hasPressed = false;
  const countdown = setInterval(() => {
    clock--;
    if (clock > 0) {
      document.getElementById("scenario").textContent = `${scenario.text} with ${formatTime(gameClock)} left! ${clock}...`;
    } else {
      clearInterval(countdown);
      document.getElementById("scenario").textContent = `${scenario.text} with ${formatTime(gameClock)} left!`;
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
  const currentScenarioText = document.getElementById("scenario").textContent.split(" with")[0];
  const scenarios = getScenarios(playerSeed, gameClock);
  const scenario = scenarios.find(s => s.text === currentScenarioText);

  let attemptResult;
  if (pressedKey === requiredDirection && reactionTime <= currentWindow) {
    playerScore += scenario.points;
    streak++;
    resultEl.textContent = "Made it!";
    resultEl.style.color = "#28a745";
    attemptResult = `${reactionTime}ms`;
  } else {
    opponentScore += Math.floor(Math.random() * 2) + 1;
    resultEl.textContent = pressedKey !== requiredDirection ? "Missed! (Wrong direction)" : "Missed! (Too late)";
    resultEl.style.color = "#dc3545";
    streak = 0;
    attemptResult = "Miss";
  }

  reactionTimes.push({ attempt: 13 - shotsLeft, result: attemptResult });
  updateReactionTracker();

  shotsLeft--;
  updateStats();
  setTimeout(() => {
    document.getElementById("direction").style.display = "none";
    resultEl.textContent = "";
    nextShot();
  }, 500);
}

function updateStats() {
  document.getElementById("shotsLeft").textContent = shotsLeft;
  document.getElementById("playerScore").textContent = playerScore;
  document.getElementById("opponentScore").textContent = opponentScore;
}

function updateReactionTracker() {
  const reactionList = document.getElementById("reactionList");
  reactionList.innerHTML = "";
  reactionTimes.forEach(({ attempt, result }) => {
    const li = document.createElement("li");
    li.textContent = `Shot ${attempt}: ${result}`;
    reactionList.appendChild(li);
  });

  const successfulTimes = reactionTimes
    .filter(r => r.result !== "Miss")
    .map(r => parseInt(r.result));
  const avgTime = successfulTimes.length > 0 ?
    Math.round(successfulTimes.reduce((a, b) => a + b, 0) / successfulTimes.length) : "N/A";
  document.getElementById("avgReaction").textContent = `Avg: ${avgTime === "N/A" ? "N/A" : avgTime + "ms"}`;
}

function endGame(won = false) {
  clearInterval(clockInterval);
  document.removeEventListener("keydown", handleKeyPress);
  document.getElementById("scenario").textContent = won ?
    `Champion! Seed ${playerSeed} - Final Score: ${playerScore}-${opponentScore}, Longest Streak: ${streak}` :
    `Game Over! Seed ${playerSeed} - Lost in ${rounds[currentGame]} (${playerScore}-${opponentScore})`;
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyPress);
