// src/types.ts

export type Position = { x: number; y: number };
export type Shape = number[][]; // 0 - пусто, 1 - блок
export type TetrominoData = {
    shape: Shape[]; // Массив форм для каждого поворота
    color: string;
};
export type Grid = string[][]; // Хранит цвета блоков или 'empty'

// --- НОВОЕ: Типы для визуальных эффектов ---
export interface Star {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    opacityChange: number; // Скорость изменения прозрачности
}

export interface Comet {
    x: number;
    y: number;
    length: number;
    width: number;
    speed: number;
    angle: number; // Угол падения
    color: string;
}

export interface Rocket {
    x: number;
    y: number;
    size: number;
    speed: number;
    color: string;
    flameOffset: number; // Для анимации пламени
}
// --- КОНЕЦ НОВОГО ---
