export default function ScoreBoard({ score, level }) {
  return (
    <div id="scoreBoard" style={{ display: 'none' }}>
      Score: <span id="score">{score}</span><br />
      Level: <span id="level">{level}</span>
    </div>
  );
}
