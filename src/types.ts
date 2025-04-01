// src/types.ts
export type Position = { x: number; y: number };
export type Shape = number[][]; // 0 - пусто, 1 - блок
export type TetrominoData = {
    shape: Shape[]; // Массив форм для каждого поворота
    color: string;
};
export type Grid = string[][]; // Хранит цвета блоков или 'empty'
