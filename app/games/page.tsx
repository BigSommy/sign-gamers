// Minor change for commit/push test
import CommunityGameCard from '@/components/CommunityGameCard';

type Game = {
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  description: string;
  imageUrl: string;
  playUrl: string;
};

export default function GamesPage() {
  // Games by our community
  const games: Game[] = [
    // Games by MUZE CAKA (@muzecaka)
    {
      id: '1',
      title: 'SIGN CARD CLASH',
      creator: 'MUZE CAKA',
      creatorHandle: 'muzecaka',
      description: 'A thrilling card game featuring SIGN characters in epic battles.',
      imageUrl: '/games/card-clash.jpg',
      playUrl: 'http://sign-cardclash.vercel.app'
    },
    {
      id: '2',
      title: 'SIGN ORANGE GAME',
      creator: 'MUZE CAKA',
      creatorHandle: 'muzecaka',
      description: 'An exciting game featuring the iconic ORANGE from SIGN universe.',
      imageUrl: '/games/orange-game.jpg',
      playUrl: 'http://sign-orange-game.vercel.app'
    },
    {
      id: '3',
      title: '2048 ON SIGN',
      creator: 'MUZE CAKA',
      creatorHandle: 'muzecaka',
      description: 'The classic 2048 game with a unique SIGN twist.',
      imageUrl: '/games/2048.jpg',
      playUrl: 'http://2048-on-sign.vercel.app'
    },
    {
      id: '4',
      title: 'SIGN IT',
      creator: 'MUZE CAKA',
      creatorHandle: 'muzecaka',
      description: 'A fun card game where you match SIGN characters.',
      imageUrl: '/games/sign-it.jpg',
      playUrl: 'http://sign-card.vercel.app'
    },
    
    // Games by King (@kingsmenx18)
    {
      id: '5',
      title: 'Tic Tac Toe',
      creator: 'King',
      creatorHandle: 'kingsmenx18',
      description: 'The classic Tic Tac Toe game with a SIGN twist.',
      imageUrl: '/games/tic-tac-toe.jpg',
      playUrl: 'https://kingsmenx18.github.io/SIGN-Tic-Tac/'
    },
    {
      id: '6',
      title: 'Mine Game',
      creator: 'King',
      creatorHandle: 'kingsmenx18',
      description: 'A fun mining game featuring SIGN characters.',
      imageUrl: '/games/mine-game.jpg',
      playUrl: 'https://kingsmenx18.github.io/SIGN-ORANGE-GAME/'
    },
    {
      id: '7',
      title: 'Flappy Bird',
      creator: 'King',
      creatorHandle: 'kingsmenx18',
      description: 'The classic Flappy Bird game with SIGN theming.',
      imageUrl: '/games/flappy-bird.jpg',
      playUrl: 'https://kingsmenx18.github.io/sign-flappy-bird/'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold relative z-10 text-orange-400 mb-4 font-['Exo_2']">
            Games by Fellow Signees
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover and play amazing games created by our talented community members.
          </p>
          <a
            href="https://x.com/bigsommy_"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200"
          >
            Submit Your Game
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>

        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-1 sm:px-2 md:px-4">
            {games.map((game) => (
              <CommunityGameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games available yet. Be the first to submit one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
