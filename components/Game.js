import { useEffect, useRef, useState } from 'react';
import Controls from './Controls';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import { 
  rotate, collide, newPiece, drop, 
  clearLines, updateLevel, move, 
  rotatePiece, dropInstant 
} from '../game-logic';

export default function Game() {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState([]);
  const [currentPiece, setCurrentPiece] = useState({ shape: [], x: 0, y: 0 });
  const [clearAnimationTime, setClearAnimationTime] = useState(0);
  const [linesToClear, setLinesToClear] = useState([]);
  const [lastTime, setLastTime] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');

    const handleKeyDown = (event) => {
      if (event.keyCode === 37) move(-1);
      if (event.keyCode === 39) move(1);
      if (event.keyCode === 40) drop();
      if (event.keyCode === 32) dropInstant();
      if (event.keyCode === 38) rotatePiece();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const canvasWidth = 300;
    const canvasHeight = 600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const drawBlock = (x, y, color) => {
      context.fillStyle = color;
      context.fillRect(x * 30, y * 30, 30, 30);
      context.strokeStyle = '#000';
      context.strokeRect(x * 30, y * 30, 30, 30);
    };

    const drawBoard = () => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const cellValue = cell;
            if (linesToClear.includes(y)) {
              const elapsed = Date.now() - clearAnimationTime;
              const progress = Math.min(elapsed / 500, 1);
              context.globalAlpha = 1 - progress;
            }
            drawBlock(x, y, colors[cellValue - 1]);
            context.globalAlpha = 1;
          }
        });
      });
    };

    const drawPiece = () => {
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
          if (value) {
            drawBlock(currentPiece.x + dx, currentPiece.y + dy, colors[value - 1]);
          }
        });
      });
    };

    const update = (time) => {
      if (gameStarted && !gameOver) {
        const deltaTime = time - lastTime;
        if (deltaTime > (1000 - (level - 1) * 50)) {
          drop();
          setLastTime(time);
        }
        requestAnimationFrame(update);
      }
    };

    const startGame = () => {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setLevel(1);
      const newBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
      setBoard(newBoard);
      setCurrentPiece({ shape: [], x: 0, y: 0 });
      setClearAnimationTime(0);
      setLinesToClear([]);
      setLastTime(0);
      newPiece();
      requestAnimationFrame(update);
    };

    const restartGame = () => {
      setGameOver(false);
      startGame();
    };

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

    const merge = () => {
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
          if (value) {
            const newY = currentPiece.y + dy;
            const newX = currentPiece.x + dx;
            if (newY < board.length) {
              board[newY][newX] = value;
            }
          }
        });
      });
      setBoard([...board]);
    };

    const clearLines = () => {
      // Реализация из game-logic.js
    };

    // Инициализация
    return () => {
      // Очистка ресурсов
    };
  }, [gameStarted, gameOver, level, board, currentPiece, linesToClear, clearAnimationTime]);

  return (
    <div id="gameContainer">
      <button id="startButton" onClick={() => setGameStarted(true)}>
        Start Game
      </button>
      <canvas ref={canvasRef} id="tetrisCanvas" style={{ display: gameStarted ? 'block' : 'none' }}></canvas>
      <ScoreBoard score={score} level={level} />
      <Controls />
      <GameOver 
        finalScore={score} 
        restartGame={() => setGameOver(false)}
      />
    </div>
  );
}
