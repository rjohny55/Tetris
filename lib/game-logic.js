export function rotate(matrix) {
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

export function collide(board, piece, x, y) {
  for (let dy = 0; dy < piece.shape.length; dy++) {
    for (let dx = 0; dx < piece.shape[dy].length; dx++) {
      if (piece.shape[dy][dx]) {
        const newX = x + dx;
        const newY = y + dy;
        if (
          newY < 0 ||
          newX < 0 ||
          newX >= 10 || // Ширина поля 10 блоков
          newY >= 20 // Высота поля 20 блоков
        ) {
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

export function newPiece() {
  const pieces = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
  ];
  const random = Math.floor(Math.random() * pieces.length);
  const shape = pieces[random].map(row => 
    row.map(cell => cell ? (random + 1) : 0)
  );
  return {
    shape,
    x: Math.floor((10 - shape[0].length) / 2), // Центрирование по горизонтали
    y: 0,
  };
}

export function drop(currentPiece, board) {
  const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
  if (collide(board, newPiece, newPiece.x, newPiece.y)) {
    newPiece.y -= 1;
    return { ...newPiece, collision: true };
  }
  return newPiece;
}

export function clearLines(board) {
  const linesCleared = [];
  for (let y = 0; y < 20; y++) {
    if (board[y].every(cell => cell !== 0)) {
      linesCleared.push(y);
    }
  }
  return linesCleared;
}

export function updateLevel(score, currentLevel) {
  const newLevel = Math.floor(score / 1000) + 1;
  return newLevel > currentLevel ? newLevel : currentLevel;
}

export function move(currentPiece, direction) {
  const newPiece = { ...currentPiece, x: currentPiece.x + direction };
  if (collide(null, newPiece, newPiece.x, newPiece.y)) {
    return currentPiece;
  }
  return newPiece;
}

export function rotatePiece(currentPiece) {
  const rotatedShape = rotate(currentPiece.shape);
  const newPiece = { ...currentPiece, shape: rotatedShape };
  if (collide(null, newPiece, newPiece.x, newPiece.y)) {
    return currentPiece;
  }
  return newPiece;
}

export function dropInstant(currentPiece, board) {
  while (currentPiece.y < 20 - currentPiece.shape.length) {
    currentPiece.y++;
    if (collide(board, currentPiece, currentPiece.x, currentPiece.y)) {
      currentPiece.y--;
      break;
    }
  }
  return currentPiece;
}
