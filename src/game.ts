// src/game.ts
import {
    COLS, ROWS, BLOCK_SIZE, EMPTY_COLOR, BORDER_COLOR, TETROMINOES,
    TETROMINO_KEYS, STARTING_SPEED, SPEED_INCREMENT, LINES_PER_LEVEL, SCORE_POINTS,
    NEXT_PIECE_AREA_SIZE
} from './constants';
import { Position, Shape, Grid, TetrominoData } from './types';

class Piece {
    type: string;
    data: TetrominoData;
    rotationIndex: number;
    currentShape: Shape;
    position: Position;

    constructor(type: string, data: TetrominoData) {
        this.type = type;
        this.data = data;
        this.rotationIndex = 0;
        this.currentShape = data.shape[this.rotationIndex];
        // Начальная позиция (примерно по центру вверху)
        this.position = { x: Math.floor(COLS / 2) - Math.floor(this.currentShape[0].length / 2), y: 0 };
    }

    // Вращение фигуры
    rotate() {
        this.rotationIndex = (this.rotationIndex + 1) % this.data.shape.length;
        this.currentShape = this.data.shape[this.rotationIndex];
    }

    // Откат вращения (если столкновение)
    unRotate() {
        this.rotationIndex = (this.rotationIndex - 1 + this.data.shape.length) % this.data.shape.length;
        this.currentShape = this.data.shape[this.rotationIndex];
    }

    // Перебор блоков текущей фигуры
    forEachBlock(callback: (x: number, y: number) => void) {
        this.currentShape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value === 1) {
                    callback(this.position.x + dx, this.position.y + dy);
                }
            });
        });
    }
}

export class Game {
    private ctx: CanvasRenderingContext2D;
    private nextCtx: CanvasRenderingContext2D;
    private scoreElement: HTMLElement;
    private levelElement: HTMLElement;

    private grid: Grid;
    private currentPiece: Piece | null = null;
    private nextPiece: Piece | null = null;
    private score: number = 0;
    private linesCleared: number = 0;
    private level: number = 1;
    private gameLoopInterval: number | null = null;
    private currentSpeed: number = STARTING_SPEED;
    public isGameOver: boolean = false;

    constructor(
        private canvas: HTMLCanvasElement,
        private nextCanvas: HTMLCanvasElement
    ) {
        this.ctx = canvas.getContext('2d')!;
        this.nextCtx = nextCanvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        this.levelElement = document.getElementById('level')!;

        // Настройка размеров канваса
        canvas.width = COLS * BLOCK_SIZE;
        canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE); // Масштабируем контекст

        nextCanvas.width = NEXT_PIECE_AREA_SIZE * BLOCK_SIZE;
        nextCanvas.height = NEXT_PIECE_AREA_SIZE * BLOCK_SIZE;
        this.nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

        this.grid = this.createEmptyGrid();
    }

    // Создание пустого игрового поля
    private createEmptyGrid(): Grid {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY_COLOR));
    }

    // Создание случайной фигуры
    private createRandomPiece(): Piece {
        const randomIndex = Math.floor(Math.random() * TETROMINO_KEYS.length);
        const type = TETROMINO_KEYS[randomIndex];
        return new Piece(type, TETROMINOES[type]);
    }

    // Запуск игры
    startGame() {
        this.resetGame();
        this.spawnPiece();
        this.gameLoop();
        console.log("Game started");
    }

    // Сброс состояния игры
    resetGame() {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.linesCleared = 0;
        this.level = 1;
        this.currentSpeed = STARTING_SPEED;
        this.isGameOver = false;
        this.updateScoreboard();
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        this.currentPiece = this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
    }

    // Создание новой фигуры
    private spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();

        // Центрируем новую фигуру
        if (this.currentPiece) {
            this.currentPiece.position.x = Math.floor(COLS / 2) - Math.floor(this.currentPiece.currentShape[0].length / 2);
            this.currentPiece.position.y = 0; // Начинаем сверху
        }

        // Проверка на Game Over сразу после спавна
        if (!this.isValidMove(this.currentPiece!.position.x, this.currentPiece!.position.y, this.currentPiece!.currentShape)) {
            this.gameOver();
        } else {
             this.drawNextPiece(); // Обновляем превью
        }
    }

    // Основной игровой цикл
    private gameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval); // Очищаем старый интервал
        }

        this.gameLoopInterval = window.setInterval(() => {
            if (!this.isGameOver) {
                this.moveDown();
                this.draw(); // Перерисовываем после каждого шага
            }
        }, this.currentSpeed);
    }

    // Обработка нажатий клавиш (вызывается из input.ts)
    handleKeydown(key: string) {
        if (this.isGameOver || !this.currentPiece) return;

        switch (key) {
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'ArrowDown':
                this.moveDown(); // Можно добавить ускорение или мгновенное падение
                break;
            case 'ArrowUp':
            case ' ': // Пробел тоже для поворота
                this.rotatePiece();
                break;
        }
        this.draw(); // Перерисовываем после действия игрока
    }

     // Обработка свайпов (вызывается из input.ts)
     handleSwipe(direction: 'left' | 'right' | 'down' | 'up' | 'tap') {
        if (this.isGameOver || !this.currentPiece) return;
         console.log("Swipe detected:", direction);
        switch (direction) {
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'up':
            case 'tap': // Тап или свайп вверх = поворот
                this.rotatePiece();
                break;
        }
        this.draw(); // Перерисовываем после действия игрока
    }


    // Движение влево
    private moveLeft() {
        if (!this.currentPiece) return;
        const { x, y } = this.currentPiece.position;
        if (this.isValidMove(x - 1, y, this.currentPiece.currentShape)) {
            this.currentPiece.position.x--;
        }
    }

    // Движение вправо
    private moveRight() {
        if (!this.currentPiece) return;
        const { x, y } = this.currentPiece.position;
        if (this.isValidMove(x + 1, y, this.currentPiece.currentShape)) {
            this.currentPiece.position.x++;
        }
    }

    // Движение вниз
    private moveDown() {
        if (!this.currentPiece) return;
        const { x, y } = this.currentPiece.position;
        if (this.isValidMove(x, y + 1, this.currentPiece.currentShape)) {
            this.currentPiece.position.y++;
        } else {
            // Фигура приземлилась
            this.placePiece();
            this.clearLines();
            this.spawnPiece(); // Создаем новую фигуру
            if(this.isGameOver) return; // Проверка после спавна
             // Обновляем скорость игры в зависимости от уровня
            this.updateSpeed();
            this.gameLoop(); // Перезапускаем таймер с новой скоростью
        }
    }

    // Поворот фигуры
    private rotatePiece() {
        if (!this.currentPiece) return;
        this.currentPiece.rotate();

        if (!this.isValidMove(this.currentPiece.position.x, this.currentPiece.position.y, this.currentPiece.currentShape)) {
            // Попробовать сдвинуть (Wall Kick - упрощенная версия)
            // Пробуем сдвинуть вправо
            if (this.isValidMove(this.currentPiece.position.x + 1, this.currentPiece.position.y, this.currentPiece.currentShape)) {
                 this.currentPiece.position.x++;
            }
            // Пробуем сдвинуть влево
            else if (this.isValidMove(this.currentPiece.position.x - 1, this.currentPiece.position.y, this.currentPiece.currentShape)) {
                 this.currentPiece.position.x--;
            }
             // Если сдвиги не помогли, отменяем поворот
            else {
                 this.currentPiece.unRotate();
            }
        }
    }

    // Проверка, является ли ход допустимым
    private isValidMove(x: number, y: number, shape: Shape): boolean {
        if (!this.currentPiece) return false;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const boardX = x + col;
                    const boardY = y + row;

                    // Проверка выхода за границы поля
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return false;
                    }
                    // Проверка столкновения с другими блоками (пропускаем пустые ячейки и верхнюю границу y<0)
                    if (boardY >= 0 && this.grid[boardY][boardX] !== EMPTY_COLOR) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Фиксация фигуры на поле
    private placePiece() {
        if (!this.currentPiece) return;
        this.currentPiece.forEachBlock((x, y) => {
            // Убедимся, что не записываем за пределами поля (хотя isValidMove должна это предотвращать)
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                this.grid[y][x] = this.currentPiece!.data.color;
            }
        });
    }

    // Очистка заполненных линий
    private clearLines() {
        let linesClearedThisTurn = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== EMPTY_COLOR)) {
                // Линия заполнена
                linesClearedThisTurn++;
                // Удаляем линию и сдвигаем все верхние вниз
                this.grid.splice(y, 1);
                // Добавляем новую пустую линию сверху
                this.grid.unshift(Array(COLS).fill(EMPTY_COLOR));
                // Нужно проверить эту же строку еще раз, т.к. она теперь новая
                y++;
            }
        }

        if (linesClearedThisTurn > 0) {
            this.updateScore(linesClearedThisTurn);
        }
    }

    // Обновление счета и уровня
    private updateScore(linesCleared: number) {
        const points = SCORE_POINTS[linesCleared as keyof typeof SCORE_POINTS] || 0;
        this.score += points * this.level; // Очки зависят от уровня
        this.linesCleared += linesCleared;
        this.level = Math.floor(this.linesCleared / LINES_PER_LEVEL) + 1;
        this.updateScoreboard();
    }

    // Обновление отображения счета и уровня
    private updateScoreboard() {
        this.scoreElement.textContent = this.score.toString();
        this.levelElement.textContent = this.level.toString();
    }

     // Обновление скорости игры
     private updateSpeed() {
        this.currentSpeed = Math.max(100, STARTING_SPEED - (this.level - 1) * SPEED_INCREMENT); // Ограничиваем минимальную скорость
    }

    // Конец игры
    private gameOver() {
        console.log("Game Over!");
        this.isGameOver = true;
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        // Можно добавить сообщение на экран
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, ROWS / 2 - 1.5, COLS, 3); // Рисуем прямоугольник для текста
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', COLS / 2, ROWS / 2);
        this.ctx.font = '0.5px Arial';
         this.ctx.fillText('Нажмите Enter или тапните для рестарта', COLS / 2, ROWS / 2 + 1);

    }

    // --- Методы отрисовки ---

    // Основная функция отрисовки
    draw() {
        this.clearCanvas(this.ctx, COLS, ROWS);
        this.drawGrid();
        this.drawSettledPieces();
        if (this.currentPiece && !this.isGameOver) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        // Не рисуем GAME OVER здесь, чтобы он не перерисовывался каждый кадр, а только один раз в gameOver()
    }

    // Очистка канваса
    private clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
        // Используем цвет фона для очистки
        ctx.fillStyle = EMPTY_COLOR;
        ctx.fillRect(0, 0, width, height);
    }

    // Отрисовка сетки (необязательно, но полезно для отладки)
    private drawGrid() {
        this.ctx.strokeStyle = BORDER_COLOR;
        this.ctx.lineWidth = 0.05; // Толщина линии относительно масштаба

        for (let x = 0; x < COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, ROWS);
            this.ctx.stroke();
        }
        for (let y = 0; y < ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(COLS, y);
            this.ctx.stroke();
        }
    }

    // Отрисовка упавших фигур
    private drawSettledPieces() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] !== EMPTY_COLOR) {
                    this.drawBlock(this.ctx, x, y, this.grid[y][x]);
                }
            }
        }
    }

    // Отрисовка текущей падающей фигуры
    private drawPiece(piece: Piece, ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = piece.data.color;
        piece.forEachBlock((x, y) => {
             // Рисуем только видимые части фигуры (внутри поля)
            if (y >= 0) {
                 this.drawBlock(ctx, x, y, piece.data.color);
            }
        });
    }

    // Отрисовка одного блока
    private drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
        // Добавим небольшую границу для визуального разделения блоков
        ctx.strokeStyle = '#333'; // Темная граница
        ctx.lineWidth = 0.05;
        ctx.strokeRect(x, y, 1, 1);
    }

     // Отрисовка следующей фигуры
     private drawNextPiece() {
        if (!this.nextPiece) return;

        this.clearCanvas(this.nextCtx, NEXT_PIECE_AREA_SIZE, NEXT_PIECE_AREA_SIZE);

        const piece = this.nextPiece;
        const shape = piece.currentShape; // Берем первую форму (не вращаем для превью)
        const shapeSize = shape.length; // Предполагаем квадратную форму области фигуры

        // Центрируем фигуру в области превью
        const offsetX = (NEXT_PIECE_AREA_SIZE - shapeSize) / 2;
        const offsetY = (NEXT_PIECE_AREA_SIZE - shapeSize) / 2;

        shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value === 1) {
                    this.drawBlock(this.nextCtx, offsetX + dx, offsetY + dy, piece.data.color);
                }
            });
        });
    }
}
