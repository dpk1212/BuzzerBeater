let currentGame = 0;
let shotsLeft = 12;
let playerScore = 0;
let opponentScore = 0;
let streak = 0;
let gameClock = 40 * 60;
let isDirectionShown = false;
let shotStartTime;
let currentWindow;
let requiredDirection;
let hasPressed = false;
let playerSeed;
let opponentSeed;
let reactionTimes = [];
let clockInterval;
let highScore = localStorage.getItem('highScore') || 0;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

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
  { text: "Open layup", points: 1, baseWindow: 1000, minTime: 20 * 60 },
  { text: "Mid-range jumper", points: 2, baseWindow: 800, minTime: 20 * 60 },
  { text: "Contested mid-range shot", points: 2, baseWindow: 800, minTime: 5 * 60 },
  { text: "Quick three-pointer", points: 3, baseWindow: 600, minTime: 5 * 60 },
  { text: "Deep three with time running out", points: 3, baseWindow: 600, minTime: 0 },
  { text: "Buzzer-beater from downtown", points: 3, baseWindow: 600, minTime: 0 }
];

const shotMadeSound = document.getElementById("shotMadeSound");
const shotMissedSound = document.getElementById("shotMissedSound");
const countdownStartSound = document.getElementById("countdownStartSound");
const gameWinSound = document.getElementById("gameWinSound");

function getScenarios(seed, timeLeft) {
  const difficultyFactor = (seed - 1) / 15;
  return baseScenarios
    .filter(s => timeLeft >= s.minTime)
    .map(scenario => ({
      ...scenario,
      window: Math.round(scenario.baseWindow * (1 - difficultyFactor * 0.3)),
      weight: scenario.points === 1 ? (1 - difficultyFactor) :
              scenario.points === 2 ? 1 :
              difficultyFactor
    }));
}

function getOpponentSeed(playerSeed) {
  return 17 - playerSeed;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

function updateLeaderboard(score, seed) {
  const entry = { score, seed, date: new Date().toLocaleDateString() };
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
  const tbody = document.querySelector("#leaderboardTable tbody");
  tbody.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${index + 1}</td><td>${entry.seed}</td><td>${entry.score}</td><td>${entry.date}</td>`;
    tbody.appendChild(tr);
  });
}

function startGame() {
  playerSeed = parseInt(document.getElementById("seedSelect").value);
  opponentSeed = getOpponentSeed(playerSeed);
  currentGame = 0;

  const landingPage = document.getElementById("landingPage");
  landingPage.classList.add("hidden");
  setTimeout(() => {
    landingPage.style.display = "none";
    document.getElementById("tutorialPage").style.display = "block";
  }, 500);
}

function beginGame() {
  const gameContainer = document.getElementById("gameContainer");
  document.getElementById("tutorialPage").style.display = "none";
  gameContainer.style.display = "flex";
  document.getElementById("reactionTracker").style.display = "block";
  gameContainer.classList.add("visible");

  document.getElementById("gameRound").textContent = rounds[currentGame];
  document.getElementById("playerSeedDisplay").textContent = `Seed ${playerSeed}`;
  document.getElementById("opponentSeedDisplay").textContent = `Seed ${opponentSeed}`;
  document.getElementById("gameClock").textContent = formatTime(gameClock);
  document.getElementById("highScoreValue").textContent = highScore;
  updateStats();

  clockInterval = setInterval(() => {
    gameClock--;
    document.getElementById("gameClock").textContent = formatTime(gameClock);
    if (gameClock <= 0) {
      clearInterval(clockInterval);
      if (shotsLeft > 0) showResultPage(false);
    }
  }, 1000);

  nextShot();
}

function nextShot() {
  const scenarios = getScenarios(playerSeed, gameClock);
  if (shotsLeft <= 0 || gameClock <= 0) {
    showResultPage(playerScore > opponentScore);
    return;
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
  requiredDirection = directions[Math.floor(Math.random() * directions.length)];
  let clock = Math.floor(Math.random() * 2) + 1;
  document.getElementById("scenario").textContent = `${scenario.text} with ${formatTime(gameClock)} left!`;
  document.getElementById("countdown").style.display = "block";
  document.getElementById("countdown").textContent = clock;
  isDirectionShown = false;
  hasPressed = false;

  countdownStartSound.loop = true; // Loop the ticking sound
  countdownStartSound.play();

  const countdown = setInterval(() => {
    clock--;
    if (clock > 0) {
      document.getElementById("countdown").textContent = clock;
    } else {
      clearInterval(countdown);
      countdownStartSound.pause();
      countdownStartSound.currentTime = 0; // Reset to start
      document.getElementById("countdown").style.display = "none";
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
  if (pressedKey === requiredDirection && reactionTime <= currentWindow + 100) {
    playerScore += scenario.points;
    streak++;
    resultEl.textContent = "Made it!";
    resultEl.style.color = "#28a745";
    attemptResult = `${reactionTime}ms`;
    shotMadeSound.play();
  } else {
    const reactionPercentage = reactionTime / currentWindow;
    opponentScore += (opponentSeed <= 4 && reactionPercentage > 0.75) ? 2 : 1;
    resultEl.textContent = pressedKey !== requiredDirection ? "Missed! (Wrong direction)" : "Missed! (Too late)";
    resultEl.style.color = "#dc3545";
    streak = 0;
    attemptResult = "Miss";
    shotMissedSound.play();
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
  const reactionList = document.getElementBySorry about that, something didn't go as planned. Please try again, and if you're still seeing this message, go ahead and restart the app.
