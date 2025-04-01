// src/input.ts
import { Game } from './game.js';
import { SWIPE_THRESHOLD, TAP_THRESHOLD_DIST, TAP_THRESHOLD_TIME } from './constants.js';

export function setupInput(game: Game, canvas: HTMLCanvasElement) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let swipeHandled = false; // Флаг, чтобы обработать свайп только один раз за касание

    // --- Клавиатура ---
    document.addEventListener('keydown', (event: KeyboardEvent) => {
         if (game.isGameOver) {
             if (event.key === 'Enter') { // Рестарт по Enter
                 game.startGame();
             }
             return; // Не обрабатываем другие клавиши при Game Over
         }
        game.handleKeydown(event.key); // Используем event.key для лучшей совместимости
         // Предотвращаем прокрутку страницы стрелками
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
    });

    // --- Сенсорный ввод (Свайпы и Тапы) ---
    canvas.addEventListener('touchstart', (event: TouchEvent) => {
        // Предотвращаем стандартное поведение (прокрутка, масштабирование)
        event.preventDefault();
        swipeHandled = false; // Сбрасываем флаг при новом касании
        if (event.touches.length === 1) { // Обрабатываем только одно касание
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }
    }, { passive: false }); // passive: false нужен для preventDefault()

    canvas.addEventListener('touchmove', (event: TouchEvent) => {
        event.preventDefault(); // Предотвращаем прокрутку во время движения пальца
        if (event.touches.length !== 1 || swipeHandled) {
            return; // Игнорируем мультитач или если свайп уже обработан
        }

        const touch = event.touches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Определяем свайп, если движение достаточно большое
        if (absDeltaX > SWIPE_THRESHOLD || absDeltaY > SWIPE_THRESHOLD) {
            swipeHandled = true; // Обрабатываем свайп
             if (absDeltaX > absDeltaY) {
                // Горизонтальный свайп
                if (deltaX > 0) {
                    game.handleSwipe('right');
                } else {
                    game.handleSwipe('left');
                }
            } else {
                // Вертикальный свайп
                 // Свайп вниз более чувствителен
                if (deltaY > SWIPE_THRESHOLD / 2) { // Уменьшаем порог для свайпа вниз
                    game.handleSwipe('down');
                } else if (deltaY < -SWIPE_THRESHOLD) { // Свайп вверх
                    game.handleSwipe('up'); // Свайп вверх - поворот
                }
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (event: TouchEvent) => {
        event.preventDefault(); // Всегда предотвращаем
         // Если был рестарт по тапу
         if (game.isGameOver) {
             game.startGame();
             return;
         }

        if (event.changedTouches.length === 1 && !swipeHandled) {
            const touch = event.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const timeDiff = touchEndTime - touchStartTime;

            // Проверяем, был ли это тап (малое смещение и короткое время)
            if (timeDiff < TAP_THRESHOLD_TIME && Math.abs(deltaX) < TAP_THRESHOLD_DIST && Math.abs(deltaY) < TAP_THRESHOLD_DIST) {
                game.handleSwipe('tap'); // Тап - поворот
            }
             // Если движение было, но не дотянуло до свайпа в touchmove (например, быстрый flick вверх)
             else if (deltaY < -SWIPE_THRESHOLD / 2) { // Проверка на быстрый свайп вверх при отпускании
                  game.handleSwipe('up');
             }
        }
        // Сбрасываем начальные координаты на всякий случай
        touchStartX = 0;
        touchStartY = 0;
        touchStartTime = 0;

    }, { passive: false });

     // Предотвращаем контекстное меню по долгому тапу
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
}
