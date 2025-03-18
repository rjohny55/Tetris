export default function GameOver({ finalScore, restartGame }) {
  return (
    <div id="gameOver" style={{ display: 'none' }}>
      Game Over<br />
      Your score: <span id="finalScore">{finalScore}</span><br />
      <button id="restartButton" onClick={restartGame}>
        Restart
      </button>
    </div>
  );
}
