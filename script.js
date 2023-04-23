const buttonClickSound = new Audio('button.mp3');
const wallHitSound = new Audio('wall_hit.mp3');
const paddleHitSound = new Audio('paddle_hit.mp3');
const scoreSound = new Audio('score.mp3');
const loseSound = new Audio('Lose.mp3');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerPaddle = {
  x: 10,
  y: canvas.height / 8 - 40,
  width: 10,
  height: 80,
  speed: 3,
  score: 0
};

const computerPaddle = {
  x: canvas.width - 20,
  y: canvas.height / 2 - 40,
  width: 10,
  height: 80,
  speed: 1.5,
  score: 0
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 5,
  dx: 2.4,
  dy: 1.2,
  speed: 1.1
};

const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const scoreboard = document.getElementById('scoreboard');
const serveButton = document.getElementById('serveButton');
serveButton.addEventListener('click', serveBall);

let moveUp = false;
let moveDown = false;

resetButton.addEventListener('click', () => {
  location.reload(); // Reload the page to reset the game and scores
});

startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  resetButton.style.display = 'block';
  playSound(buttonClickSound); // Modified line
  startGame();
  canvas.style.cursor = 'none';
  gameLoop();
});

serveButton.addEventListener('click', () => {
  playSound(buttonClickSound); // Modified line
  serveBall();
  canvas.style.cursor = 'none';
});

resetButton.addEventListener('click', () => {
  playSound(buttonClickSound); // Modified line
  location.reload();
});

function startGame() {
  startButton.style.display = 'none';
  resetButton.style.display = 'block';
  canvas.style.cursor = 'default';
  gameLoop();
}

function resetGame() {
  window.location.reload()
}

function updateScoreboard() {
  scoreboard.textContent = `Player: ${playerPaddle.score} | Computer: ${computerPaddle.score}`;
}

function drawPaddle(x, y, width, height) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}

function drawBall(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 1, Math.PI * 4);
  ctx.fillStyle = 'limegreen';
  ctx.fill();
  ctx.closePath();
}

function playSound(sound) {
  // Clone the sound object
  const clonedSound = sound.cloneNode();
  
  // Play the cloned sound
  clonedSound.play();
}

document.addEventListener('mousemove', (event) => {
  const relativeY = event.clientY - canvas.offsetTop;
  playerPaddle.y = relativeY - playerPaddle.height / 2;

  // Clamp the paddle position within the canvas
  if (playerPaddle.y < 0) {
    playerPaddle.y = 0;
  } else if (playerPaddle.y + playerPaddle.height > canvas.height) {
    playerPaddle.y = canvas.height - playerPaddle.height;
  }
});

function mouseMoveHandler(event) {
  const relativeY = event.clientY - canvas.offsetTop;
  if (relativeY > 0 && relativeY < canvas.height) {
    playerPaddle.y = relativeY - playerPaddle.height / 2;
  }
}

function update() {
  if (moveUp && playerPaddle.y > 0) {
    playerPaddle.y -= playerPaddle.speed;
  }
  if (moveDown && playerPaddle.y < canvas.height - playerPaddle.height) {
    playerPaddle.y += playerPaddle.speed;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    playSound(wallHitSound);
    ball.dy = -ball.dy;
  }

  if (ball.x < 0) {
    computerPaddle.score++;
    updateScoreboard();
    playSound(loseSound);
    resetBall(1); // Serve to the right (player)
    return;
  }

  if (ball.x > canvas.width) {
    playerPaddle.score++;
    updateScoreboard();
    playSound(scoreSound);
    resetBall(-1); // Serve to the left (computer)
    return;
  }

  if (
    ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
    ball.y + ball.radius > playerPaddle.y &&
    ball.y - ball.radius < playerPaddle.y + playerPaddle.height
  ) {
    playSound(paddleHitSound);
    ball.dx = -ball.dx * ball.speed;
    ball.dy += (Math.random() - 0.5) * 4; // Add randomness to the vertical direction
  }

  if (
    ball.x + ball.radius > computerPaddle.x &&
    ball.y + ball.radius > computerPaddle.y &&
    ball.y - ball.radius < computerPaddle.y + computerPaddle.height
  ) {
    playSound(paddleHitSound);
    ball.dx = -ball.dx * ball.speed;
    ball.dy = (Math.random() - 0.5) * 3; // Add randomness to the vertical direction
  }

  computerPaddle.y += (ball.y - (computerPaddle.y + computerPaddle.height / 2)) * 0.041;
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
  drawPaddle(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);
  drawBall(ball.x, ball.y, ball.radius);
  drawDottedLine();
}

function drawDottedLine() {
  const segmentLength = 25;
  const gapLength = 6;

  for (let y = 0; y < canvas.height; y += segmentLength + gapLength) {
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - 1, y, 2, segmentLength);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function resetBall(serveDirection) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 0;
  ball.dy = 0;
  canvas.style.cursor = 'default'; // Add this line to show the cursor when the "Serve" button appears
  serveButton.style.display = 'block';
  serveButton.dataset.serveDirection = serveDirection;
}

function serveBall() {
  const serveDirection = parseInt(serveButton.dataset.serveDirection);
  ball.dx = serveDirection * 2.4;
  ball.dy = 1.2;
  serveButton.style.display = 'none';
}

// The game won't start until the start button is clicked
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  gameLoop();
});
