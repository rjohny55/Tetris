import Head from 'next/head';
import Game from '../components/Game';

export default function Home() {
  return (
    <div className="game-container">
      <Head>
        <title>Tetris Game</title>
        <link rel="stylesheet" href="/styles/global.css" />
      </Head>
      <Game />
    </div>
  );
}
