const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerScore = 0;
let aiScore = 0;
let firstBall = true;

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 10;

let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;

let ballSpeedX = 4;
let ballSpeedY = 4;

let upPressed = false;
let downPressed = false;

// Controls
document.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") {
        upPressed = true;
    }

    if (e.key === "s" || e.key === "ArrowDown") {
        downPressed = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "ArrowUp") {
        upPressed = false;
    }

    if (e.key === "s" || e.key === "ArrowDown") {
        downPressed = false;
    }
});

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
	firstBall = true;
}

function update() {
    // Player movement
    if (upPressed && playerY > 0) playerY -= 6;
    if (downPressed && playerY < canvas.height - paddleHeight) playerY += 6;

	// AI movement with error
	let aiSpeed = 3;
	let errorMargin = 30;

	// If it's the first ball, play perfectly
	if (firstBall) {
		if (aiY + paddleHeight / 2 < ballY) {
			aiY += 5;  // faster, perfect tracking
		} else {
			aiY -= 5;
		}
	} else {
		// Imperfect AI after first return
		let target = ballY + (Math.random() * errorMargin - errorMargin / 2);

		if (aiY + paddleHeight / 2 < target) {
			aiY += aiSpeed;
		} else {
			aiY -= aiSpeed;
		}
	}

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top & bottom collision
    if (ballY <= 0 || ballY >= canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Player paddle collision
	if (
		ballX - ballSize <= paddleWidth &&
		ballY + ballSize > playerY &&
		ballY - ballSize < playerY + paddleHeight
	) {
		ballX = paddleWidth + ballSize; // push ball outside paddle
		ballSpeedX = -ballSpeedX;
	}

    // AI paddle collision
	if (
		ballX + ballSize >= canvas.width - paddleWidth &&
		ballY + ballSize > aiY &&
		ballY - ballSize < aiY + paddleHeight
	) {
		ballX = canvas.width - paddleWidth - ballSize; // push out
		ballSpeedX = -ballSpeedX;

		// After first successful hit, turn off perfect mode
		firstBall = false;
	}

    // Score
    if (ballX < 0) {
        aiScore++;
        document.getElementById("aiScore").textContent = aiScore;
        resetBall();
    }

    if (ballX > canvas.width) {
        playerScore++;
        document.getElementById("playerScore").textContent = playerScore;
        resetBall();
    }
}

function draw() {
    drawRect(0, 0, canvas.width, canvas.height, "#1e8f3e");

    // Middle line
    drawRect(canvas.width / 2 - 1, 0, 2, canvas.height, "white");

    // Player paddle
    drawRect(0, playerY, paddleWidth, paddleHeight, "white");

    // AI paddle
    drawRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight, "white");

    drawBall();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();