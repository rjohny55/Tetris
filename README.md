```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tetris Game</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #1a1a1a;
            font-family: Arial, sans-serif;
            touch-action: none;
        }
        #gameContainer {
            position: relative;
            text-align: center;
            background: #2d2d2d;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        #startButton {
            margin: 20px auto;
            padding: 12px 30px;
            font-size: 1.2em;
            background: #4CAF50;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: 0.3s;
            display: block;
        }
        #controls {
            position: absolute;
            width: 100%;
            bottom: -80px;
            display: none;
            justify-content: space-around;
        }
        #controls button {
            padding: 15px 30px;
            font-size: 1.5em;
            background: #007bff;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: 0.3s;
        }
        #controls button:hover {
            background: #0056b3;
        }
        canvas {
            border: 2px solid #4a4a4a;
            background: #000;
            display: none;
        }
        #scoreBoard {
            margin-top: 15px;
            color: white;
            font-size: 1.2em;
            display: none;
        }
        #gameOver {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-size: 2em;
            display: none;
            text-align: center;
        }
        #restartButton {
            margin-top: 20px;
            padding: 10px 20px;
            background: #4CAF50;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="gameContainer">
        <button id="startButton">Start Game</button>
        <canvas id="tetrisCanvas"></canvas>
        <div id="scoreBoard">
            Score: <span id="score">0</span><br>
            Level: <span id="level">1</span>
        </div>
        <div id="controls">
            <button id="leftButton">←</button>
            <button id="rotateButton">↻</button>
            <button id="rightButton">→</button>
        </div>
        <div id="gameOver" style="display: none;">
            Game Over<br>
            Your score: <span id="finalScore"></span><br>
            <button id="restartButton">Restart</button>
        </div>
    </div>
<script>
const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
canvas.width = 300;
canvas.height = 600;
const blockSize = 30;
const boardWidth = canvas.width / blockSize;
const boardHeight = canvas.height / blockSize;
const colors = ['#00FFFF', '#FFFF00', '#87CEEB', '#FF00FF', '#FFA500', '#FFD700', '#1E90FF'];
const pieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,0,0],[1,1,1]], // L
    [[0,0,1],[1,1,1]], // J
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]] // Z
];
let board = Array.from({length: boardHeight}, () => Array(boardWidth).fill(0));
let currentPiece = { shape: [], x: 0, y: 0 };
let score = 0;
let level = 1;
let dropSpeed = 600;
let lastTime = 0;
let gameStarted = false;
let gameOver = false;
let touchStartX = 0;
let touchStartY = 0;
let linesToClear = [];
let clearAnimationTime = 0;
const ANIMATION_DURATION = 500;

function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    context.strokeStyle = '#000';
    context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < boardHeight; y++) {
        for (let x = 0; x < boardWidth; x++) {
            if (board[y][x]) {
                const cellValue = board[y][x];
                if (linesToClear.includes(y)) {
                    const elapsed = Date.now() - clearAnimationTime;
                    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
                    context.globalAlpha = 1 - progress;
                }
                drawBlock(x, y, colors[cellValue-1]);
                context.globalAlpha = 1;
            }
        }
    }
}

function drawPiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                drawBlock(currentPiece.x + dx, currentPiece.y + dy, colors[value-1]);
            }
        });
    });
}

function collide() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;
                if (newY < 0 || newX < 0 || newX >= boardWidth || newY >= boardHeight) {
                    return true;
                }
                if (board[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[currentPiece.y + dy][currentPiece.x + dx] = value;
            }
        });
    });
}

function rotate(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            rotated[j][rows - i - 1] = matrix[i][j];
        }
    }
    return rotated;
}

function newPiece() {
    const random = Math.floor(Math.random() * pieces.length);
    currentPiece.shape = pieces[random].map(row => 
        row.map(cell => cell ? (random + 1) : 0)
    );
    currentPiece.x = Math.floor((boardWidth - currentPiece.shape[0].length) / 2);
    currentPiece.y = 0;
    if (collide()) {
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').innerText = score;
        gameStarted = false;
        gameOver = true;
        return;
    }
    drawBoard();
    drawPiece();
}

function drop() {
    currentPiece.y++;
    if (collide()) {
        currentPiece.y--;
        merge();
        clearLines();
        newPiece();
    }
    drawBoard();
    drawPiece();
}

function dropInstant() {
    while (currentPiece.y < boardHeight - currentPiece.shape.length) {
        currentPiece.y++;
        if (collide()) {
            currentPiece.y--;
            break;
        }
    }
    merge();
    clearLines();
    newPiece();
}

function clearLines() {
    let linesCleared = 0;
    linesToClear = [];
    for (let y = boardHeight - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            linesToClear.push(y);
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * (100 * level);
        document.getElementById('score').innerText = score;
        updateLevel();
        clearAnimationTime = Date.now();
        setTimeout(() => {
            for (let i = linesCleared - 1; i >= 0; i--) {
                board.splice(linesToClear[i], 1);
            }
            for (let i = 0; i < linesCleared; i++) {
                board.unshift(Array(boardWidth).fill(0));
            }
            linesToClear = [];
            drawBoard();
            newPiece();
        }, ANIMATION_DURATION);
    }
}

function updateLevel() {
    level = Math.floor(score / 1000) + 1;
    document.getElementById('level').innerText = level;
    dropSpeed = 1000 - (level - 1) * 50;
    if (dropSpeed < 300) dropSpeed = 300;
}

function move(direction) {
    if (!gameStarted || gameOver) return;
    const originalX = currentPiece.x;
    currentPiece.x += direction;
    if (collide()) currentPiece.x = originalX;
}

function rotatePiece() {
    if (!gameStarted || gameOver) return;
    const originalShape = currentPiece.shape;
    currentPiece.shape = rotate(currentPiece.shape);
    if (collide()) currentPiece.shape = originalShape;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) move(-1);
    if (event.keyCode === 39) move(1);
    if (event.keyCode === 40) drop();
    if (event.keyCode === 32) dropInstant();
    if (event.keyCode === 38) rotatePiece();
});

canvas.addEventListener('touchstart', (e) => {
    if (!gameStarted || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    touchStartX = e.touches[0].clientX - rect.left;
    touchStartY = e.touches[0].clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    if (!gameStarted || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const touchEndX = e.changedTouches[0].clientX - rect.left;
    const touchEndY = e.changedTouches[0].clientY - rect.top;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 50) move(1);
        else if (deltaX < -50) move(-1);
    } else {
        if (deltaY < -50) rotatePiece();
        else if (deltaY > 50) dropInstant();
    }
});

function update(time = 0) {
    if (!gameStarted || gameOver) return;
    const deltaTime = time - lastTime;
    if (deltaTime > dropSpeed) {
        drop();
        lastTime = time;
    }
    requestAnimationFrame(update);
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    gameOver = false;
    document.getElementById('gameOver').style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('scoreBoard').style.display = 'block';
    document.getElementById('controls').style.display = 'flex';
    startButton.style.display = 'none';
    board = Array.from({length: boardHeight}, () => Array(boardWidth).fill(0));
    score = 0;
    level = 1;
    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;
    newPiece();
    requestAnimationFrame(update);
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    startGame();
}

startButton.addEventListener('click', startGame);
document.getElementById('leftButton').addEventListener('click', () => move(-1));
document.getElementById('rightButton').addEventListener('click', () => move(1));
document.getElementById('rotateButton').addEventListener('click', rotatePiece);
document.getElementById('restartButton').addEventListener('click', restartGame);
</script>
</body>
</html>
```
