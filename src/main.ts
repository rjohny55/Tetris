// src/main.ts
import { Game } from './game';
import { setupInput } from './input';

// Получаем элементы DOM после загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas') as HTMLCanvasElement;
    const nextCanvas = document.getElementById('nextPieceCanvas') as HTMLCanvasElement;

    if (!canvas || !nextCanvas) {
        console.error("Не найдены элементы canvas!");
        return;
    }

    const game = new Game(canvas, nextCanvas);
    setupInput(game, canvas); // Передаем основной канвас для обработки тач-событий
    game.startGame();

    console.log("Tetris Initialized");
});
