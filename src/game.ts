// src/game.ts
import {
    COLS, ROWS, BLOCK_SIZE, EMPTY_COLOR, GRID_BORDER_COLOR, TETROMINOES,
    TETROMINO_KEYS, STARTING_SPEED, SPEED_INCREMENT, LINES_PER_LEVEL, SCORE_POINTS,
    NEXT_PIECE_AREA_SIZE,
    // --- НОВОЕ: Импорт констант эффектов ---
    NUM_STARS, STAR_TWINKLE_SPEED,
    NUM_COMETS, COMET_SPEED_MIN, COMET_SPEED_MAX, COMET_LENGTH_MIN, COMET_LENGTH_MAX, COMET_WIDTH, COMET_COLORS,
    NUM_ROCKETS, ROCKET_SPEED_MIN, ROCKET_SPEED_MAX, ROCKET_SIZE, ROCKET_COLOR, ROCKET_FLAME_COLOR
} from './constants.js'; // <-- Убедитесь, что тут .js
import { Position, Shape, Grid, TetrominoData, Star, Comet, Rocket } from './types.js'; // <-- Убедитесь, что тут .js

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
        this.position = { x: Math.floor(COLS / 2) - Math.floor(this.currentShape[0].length / 2), y: 0 };
    }

    rotate() {
        this.rotationIndex = (this.rotationIndex + 1) % this.data.shape.length;
        this.currentShape = this.data.shape[this.rotationIndex];
    }

    unRotate() {
        this.rotationIndex = (this.rotationIndex - 1 + this.data.shape.length) % this.data.shape.length;
        this.currentShape = this.data.shape[this.rotationIndex];
    }

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
    private canvasWidth: number; // Ширина канваса в пикселях
    private canvasHeight: number; // Высота канваса в пикселях

    private grid: Grid;
    private currentPiece: Piece | null = null;
    private nextPiece: Piece | null = null;
    private score: number = 0;
    private linesCleared: number = 0;
    private level: number = 1;
    private gameLoopInterval: number | null = null;
    private currentSpeed: number = STARTING_SPEED;
    public isGameOver: boolean = false;

    // --- НОВОЕ: Хранилища для эффектов ---
    private stars: Star[] = [];
    private comets: Comet[] = [];
    private rockets: Rocket[] = [];
    // --- КОНЕЦ НОВОГО ---

    constructor(
        private canvas: HTMLCanvasElement,
        private nextCanvas: HTMLCanvasElement
    ) {
        this.ctx = canvas.getContext('2d')!;
        this.nextCtx = nextCanvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        this.levelElement = document.getElementById('level')!;

        // --- ИЗМЕНЕНО: Убираем масштабирование основного контекста! ---
        this.canvasWidth = COLS * BLOCK_SIZE;
        this.canvasHeight = ROWS * BLOCK_SIZE;
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;

        // Оставляем масштабирование для nextCanvas
        nextCanvas.width = NEXT_PIECE_AREA_SIZE * BLOCK_SIZE;
        nextCanvas.height = NEXT_PIECE_AREA_SIZE * BLOCK_SIZE;
        this.nextCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

        this.grid = this.createEmptyGrid();
        // --- НОВОЕ: Инициализация эффектов при создании игры ---
        this.initBackgroundEffects();
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

    // --- НОВОЕ: Инициализация фоновых эффектов ---
    private initBackgroundEffects(): void {
        // Звезды
        this.stars = [];
        for (let i = 0; i < NUM_STARS; i++) {
            this.stars.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                opacityChange: (Math.random() - 0.5) * STAR_TWINKLE_SPEED * 2
            });
        }

        // Кометы
        this.comets = [];
        for (let i = 0; i < NUM_COMETS; i++) {
            this.comets.push(this.createComet());
        }

        // Ракеты
        this.rockets = [];
         for (let i = 0; i < NUM_ROCKETS; i++) {
            this.rockets.push(this.createRocket());
        }
    }

    // --- НОВОЕ: Создание одной кометы ---
    private createComet(): Comet {
         const angleRad = (Math.random() * 60 + 15) * (Math.PI / 180);
         const startX = Math.random() * this.canvasWidth * 1.5 - this.canvasWidth * 0.25;
         const startY = - (Math.random() * this.canvasHeight * 0.5 + 50);
        return {
            x: startX,
            y: startY,
            length: Math.random() * (COMET_LENGTH_MAX - COMET_LENGTH_MIN) + COMET_LENGTH_MIN,
            width: COMET_WIDTH,
            speed: Math.random() * (COMET_SPEED_MAX - COMET_SPEED_MIN) + COMET_SPEED_MIN,
            angle: angleRad,
            color: COMET_COLORS[Math.floor(Math.random() * COMET_COLORS.length)]
        };
    }

     // --- НОВОЕ: Создание одной ракеты ---
    private createRocket(): Rocket {
         return {
             x: Math.random() * this.canvasWidth * 0.8 + this.canvasWidth * 0.1,
             y: this.canvasHeight + Math.random() * 100 + 50,
             size: ROCKET_SIZE,
             speed: Math.random() * (ROCKET_SPEED_MAX - ROCKET_SPEED_MIN) + ROCKET_SPEED_MIN,
             color: ROCKET_COLOR,
             flameOffset: 0
         };
     }

    // --- НОВОЕ: Обновление состояния фоновых эффектов ---
    private updateBackgroundEffects(): void {
        // Обновление звезд
        this.stars.forEach(star => {
            star.opacity += star.opacityChange;
            if (star.opacity <= 0.1 || star.opacity >= 0.8) {
                star.opacityChange *= -1;
                star.opacity = Math.max(0.1, Math.min(0.8, star.opacity));
            }
        });

        // Обновление комет
        this.comets.forEach((comet, index) => {
            comet.x += Math.cos(comet.angle) * comet.speed;
            comet.y += Math.sin(comet.angle) * comet.speed;
            if (comet.y > this.canvasHeight + comet.length * 2 || comet.x < -comet.length * 2 || comet.x > this.canvasWidth + comet.length * 2) {
                this.comets[index] = this.createComet();
            }
        });

         // Обновление ракет
         this.rockets.forEach((rocket, index) => {
            rocket.y -= rocket.speed;
            rocket.flameOffset = Math.random() * 4 + 1;
            if (rocket.y < -rocket.size * 3) {
                 this.rockets[index] = this.createRocket();
            }
        });
    }

    // --- НОВОЕ: Отрисовка фоновых эффектов ---
    private drawBackgroundEffects(): void {
        // Рисуем звезды
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Рисуем кометы
        this.comets.forEach(comet => {
            const endX = comet.x - Math.cos(comet.angle) * comet.length;
            const endY = comet.y - Math.sin(comet.angle) * comet.length;
            const gradient = this.ctx.createLinearGradient(comet.x, comet.y, endX, endY);
            gradient.addColorStop(0, comet.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = comet.width;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(comet.x, comet.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        });

        // Рисуем ракеты
        this.rockets.forEach(rocket => {
            // Корпус
            this.ctx.fillStyle = rocket.color;
            this.ctx.beginPath();
            this.ctx.moveTo(rocket.x, rocket.y - rocket.size * 1.5);
            this.ctx.lineTo(rocket.x - rocket.size / 2, rocket.y);
            this.ctx.lineTo(rocket.x + rocket.size / 2, rocket.y);
            this.ctx.closePath();
            this.ctx.fill();
            // Пламя
            this.ctx.fillStyle = ROCKET_FLAME_COLOR;
            this.ctx.beginPath();
             this.ctx.moveTo(rocket.x - rocket.size / 3, rocket.y);
             this.ctx.lineTo(rocket.x + rocket.size / 3, rocket.y);
             this.ctx.lineTo(rocket.x, rocket.y + rocket.size + rocket.flameOffset);
             this.ctx.closePath();
             this.ctx.fill();
        });
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
        // --- НОВОЕ: Переинициализация эффектов при рестарте ---
        this.initBackgroundEffects();
        // --- КОНЕЦ НОВОГО ---
        this.currentPiece = this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
    }

    // Создание новой фигуры
    private spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        if (this.currentPiece) {
            this.currentPiece.position.x = Math.floor(COLS / 2) - Math.floor(this.currentPiece.currentShape[0].length / 2);
            this.currentPiece.position.y = 0;
        }
        if (!this.isValidMove(this.currentPiece!.position.x, this.currentPiece!.position.y, this.currentPiece!.currentShape)) {
            this.gameOver();
        } else {
             this.drawNextPiece();
        }
    }

    // Основной игровой цикл
    private gameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        this.gameLoopInterval = window.setInterval(() => {
            if (!this.isGameOver) {
                this.moveDown();
                this.draw(); // Полная перерисовка кадра
            }
        }, this.currentSpeed);
    }

    // Обработка нажатий клавиш
    handleKeydown(key: string) {
         if (this.isGameOver && key === 'Enter') {
             this.startGame();
             return;
         }
        if (this.isGameOver || !this.currentPiece) return;
        switch (key) {
            case 'ArrowLeft': this.moveLeft(); break;
            case 'ArrowRight': this.moveRight(); break;
            case 'ArrowDown': this.moveDown(); break;
            case 'ArrowUp': case ' ': this.rotatePiece(); break;
        }
        this.draw();
    }

     // Обработка свайпов
     handleSwipe(direction: 'left' | 'right' | 'down' | 'up' | 'tap') {
        if (this.isGameOver && (direction === 'tap' || direction === 'up')) {
             this.startGame();
             return;
         }
        if (this.isGameOver || !this.currentPiece) return;
        console.log("Swipe detected:", direction);
        switch (direction) {
            case 'left': this.moveLeft(); break;
            case 'right': this.moveRight(); break;
            case 'down': this.moveDown(); break;
            case 'up': case 'tap': this.rotatePiece(); break;
        }
        this.draw();
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
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
            if(this.isGameOver) return;
            this.updateSpeed();
            this.gameLoop(); // Перезапускаем таймер с новой скоростью
        }
    }

    // Поворот фигуры
    private rotatePiece() {
        if (!this.currentPiece) return;
        this.currentPiece.rotate();
        if (!this.isValidMove(this.currentPiece.position.x, this.currentPiece.position.y, this.currentPiece.currentShape)) {
            if (this.isValidMove(this.currentPiece.position.x + 1, this.currentPiece.position.y, this.currentPiece.currentShape)) {
                 this.currentPiece.position.x++;
            }
            else if (this.isValidMove(this.currentPiece.position.x - 1, this.currentPiece.position.y, this.currentPiece.currentShape)) {
                 this.currentPiece.position.x--;
            }
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
                    if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                        return false;
                    }
                    if (boardY >= 0 && this.grid[boardY] && this.grid[boardY][boardX] !== EMPTY_COLOR) {
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
                linesClearedThisTurn++;
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(EMPTY_COLOR));
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
        this.score += points * this.level;
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
        this.currentSpeed = Math.max(100, STARTING_SPEED - (this.level - 1) * SPEED_INCREMENT);
    }

    // Конец игры
    private gameOver() {
        console.log("Game Over!");
        this.isGameOver = true;
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        // Рисуем сообщение поверх всего остального
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, this.canvasHeight / 2 - 40, this.canvasWidth, 90);

        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2);

        this.ctx.font = '20px Arial';
        this.ctx.fillText('Нажмите Enter или тапните для рестарта', this.canvasWidth / 2, this.canvasHeight / 2 + 35);
    }

    // --- Методы отрисовки (АДАПТИРОВАНЫ) ---

    // Основная функция отрисовки
    draw() {
        if (!this.isGameOver) {
             this.updateBackgroundEffects();
        }
        this.clearCanvas(this.ctx, this.canvasWidth, this.canvasHeight); // Очищаем черным
        this.drawBackgroundEffects(); // Рисуем фон эффекты
        this.drawGrid(); // Рисуем сетку
        this.drawSettledPieces(); // Рисуем упавшие фигуры
        if (this.currentPiece && !this.isGameOver) {
            this.drawPiece(this.currentPiece, this.ctx); // Рисуем текущую фигуру
        }
        // Game Over рисуется в gameOver()
    }

    // Очистка канваса
    private clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.fillStyle = EMPTY_COLOR; // Теперь черный
        ctx.fillRect(0, 0, width, height);
    }

    // Отрисовка сетки
    private drawGrid() {
        this.ctx.strokeStyle = GRID_BORDER_COLOR;
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, this.canvasHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(this.canvasWidth, y * BLOCK_SIZE);
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
        piece.forEachBlock((gridX, gridY) => {
            if (gridY >= 0) {
                 this.drawBlock(ctx, gridX, gridY, piece.data.color);
            }
        });
    }

    // Отрисовка одного блока (принимает координаты сетки)
    private drawBlock(ctx: CanvasRenderingContext2D, gridX: number, gridY: number, color: string) {
        const pixelX = gridX * BLOCK_SIZE;
        const pixelY = gridY * BLOCK_SIZE;
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
    }

// Отрисовка следующей фигуры (использует масштабированный nextCtx)
private drawNextPiece() {
    if (!this.nextPiece) return;

    // Очищаем nextCtx основным фоновым цветом игры (черным)
    this.nextCtx.fillStyle = EMPTY_COLOR;
    this.nextCtx.fillRect(0, 0, NEXT_PIECE_AREA_SIZE, NEXT_PIECE_AREA_SIZE);

    const piece = this.nextPiece;
    const shape = piece.currentShape;
    const shapeSize = shape.length; // Размер матрицы фигуры (e.g., 2 для O, 3 для T, 4 для I)
    // Центрируем фигуру в области превью (размером NEXT_PIECE_AREA_SIZE)
    const offsetX = (NEXT_PIECE_AREA_SIZE - shapeSize) / 2;
    const offsetY = (NEXT_PIECE_AREA_SIZE - shapeSize) / 2;

    // --- НАЧАЛО ИЗМЕНЕНИЙ: Рисуем прямо на nextCtx ---
    this.nextCtx.fillStyle = piece.data.color; // Цвет фигуры
    this.nextCtx.strokeStyle = '#555';         // Цвет границы для превью (чуть светлее)
    this.nextCtx.lineWidth = 0.05;             // Тонкая линия (т.к. контекст масштабирован)

    shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value === 1) {
                // Координаты в масштабированной системе nextCtx
                const drawX = offsetX + dx;
                const drawY = offsetY + dy;

                // Рисуем квадрат 1x1, который будет растянут масштабированием
                this.nextCtx.fillRect(drawX, drawY, 1, 1);
                this.nextCtx.strokeRect(drawX, drawY, 1, 1);
            }
        });
    });
    // --- КОНЕЦ ИЗМЕНЕНИЙ ---
}
