// src/constants.ts
import { TetrominoData } from './types.js'; // Убедитесь что тут .js

export const COLS = 10; // Ширина поля в блоках
export const ROWS = 20; // Высота поля в блоках
export const BLOCK_SIZE = 30; // Размер блока в пикселях
export const NEXT_PIECE_AREA_SIZE = 4; // Размер области для следующей фигуры в блоках

export const EMPTY_COLOR = '#000000'; // <-- ИЗМЕНЕНО НА ЧЕРНЫЙ
export const GRID_BORDER_COLOR = '#444444'; // Цвет сетки (сделаем темнее)
export const BORDER_COLOR = '#333'; // Цвет рамки канваса

// Определения фигур Тетрамино (каждая фигура - массив поворотов)
export const TETROMINOES: { [key: string]: TetrominoData } = {
    I: {
        shape: [
            [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
            [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
            [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]]
        ],
        color: 'cyan'
    },
    O: {
        shape: [
            [[1, 1], [1, 1]]
        ],
        color: 'yellow'
    },
    T: {
        shape: [
            [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
            [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
        ],
        color: 'purple'
    },
    S: {
        shape: [
            [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
            [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
            [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
        ],
        color: 'green'
    },
    Z: {
        shape: [
            [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
            [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
        ],
        color: 'red'
    },
    J: {
        shape: [
            [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
            [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
            [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
        ],
        color: 'blue'
    },
    L: {
        shape: [
            [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
            [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
            [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
        ],
        color: 'orange'
    }
};

export const TETROMINO_KEYS = Object.keys(TETROMINOES);

// Начальная скорость и ускорение
export const STARTING_SPEED = 800; // мс между шагами вниз
export const SPEED_INCREMENT = 50; // На сколько уменьшать интервал за уровень
export const LINES_PER_LEVEL = 10; // Линий для перехода на следующий уровень

// Очки за линии
export const SCORE_POINTS = {
    1: 100, // 1 линия
    2: 300, // 2 линии
    3: 500, // 3 линии
    4: 800  // 4 линии (Тетрис)
};

// Константы для свайпов
export const SWIPE_THRESHOLD = 50; // Минимальное расстояние для регистрации свайпа (в пикселях)
export const TAP_THRESHOLD_TIME = 200; // Макс время для тапа (мс)
export const TAP_THRESHOLD_DIST = 10;  // Макс расстояние для тапа (пикс)

// --- НОВОЕ: Константы для визуальных эффектов ---
export const NUM_STARS = 100; // Количество звезд
export const STAR_COLOR = 'rgba(255, 255, 255, 0.8)'; // Белые звезды (цвет задается при рисовании с опасити)
export const STAR_TWINKLE_SPEED = 0.01; // Скорость мерцания

export const NUM_COMETS = 5; // Количество комет
export const COMET_SPEED_MIN = 2;
export const COMET_SPEED_MAX = 5;
export const COMET_LENGTH_MIN = 40;
export const COMET_LENGTH_MAX = 80;
export const COMET_WIDTH = 2;
export const COMET_COLORS = ['#FFFFE0', '#ADD8E6', '#FFB6C1']; // Светло-желтый, голубой, розовый

export const NUM_ROCKETS = 3; // Количество ракет
export const ROCKET_SPEED_MIN = 1;
export const ROCKET_SPEED_MAX = 3;
export const ROCKET_SIZE = 10; // Размер основания треугольника
export const ROCKET_COLOR = '#D3D3D3'; // Светло-серый
export const ROCKET_FLAME_COLOR = '#FFA500'; // Оранжевый
// --- КОНЕЦ НОВОГО ---
