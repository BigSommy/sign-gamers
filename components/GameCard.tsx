import Image from 'next/image';
import Link from 'next/link';

type Game = {
  id: string;
  title: string;
  creator: string;
  creatorHandle: string;
  description: string;
  imageUrl: string;
  playUrl: string;
};

type GameCardProps = {
  game: Game;
};

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-800 hover:border-orange-500/50">
      <div className="relative h-48 w-full">
        <Image
          src={game.imageUrl}
          alt={game.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 font-['Exo_2']">
          {game.title}
        </h3>
        
        <div className="flex items-center mb-3">
          <span className="text-sm text-gray-400">by </span>
          <a 
            href={`https://x.com/${game.creatorHandle}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-1 text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium"
          >
            @{game.creatorHandle}
          </a>
        </div>
        
        {game.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {game.description}
          </p>
        )}
        
        <div className="mt-4">
          <a
            href={game.playUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            Play Now
            <svg
              className="ml-2 -mr-1 w-4 h-4"
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
      </div>
    </div>
  );
}
