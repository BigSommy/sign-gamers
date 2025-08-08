import Link from 'next/link';

export default function Header({ navOpen, setNavOpen }: { navOpen: boolean, setNavOpen: (open: boolean) => void }) {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#18181b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="Sign Gamers Logo" className="h-9 w-9 md:h-11 border border-[#f23900] md:w-11 rounded-lg shadow" />
            <span className="text-lg md:text-2xl font-extrabold text-orange-400 drop-shadow font-['Exo_2']">Sign Gamers</span>
          </Link>
          <div className="flex items-center gap-2">
            <a 
              href="https://x.com/signgamers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/30"
              style={{ minWidth: 0 }}
            >
              JOIN US
            </a>
            {/* Menu button for nav panel */}
            <button
              aria-label="Open navigation"
              className="ml-1 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-200 md:hidden"
              onClick={() => setNavOpen(true)}
              style={{ display: navOpen ? 'none' : 'block' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content hiding behind header */}
      <div className="pt-8 md:pt-10" aria-hidden="true" />
    </>
  );
}