import Link from 'next/link';
import { games } from './gamesData';
import LatestBlogPosts from './LatestBlogPosts';
import LatestMedia from './components/LatestMedia';

export default function Home() {
  return (
    <div className="relative w-full">
      <div className="fixed inset-0 -z-10">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a2e_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2e_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 border-t-4 border-l-4 border-orange-500/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 border-t-4 border-r-4 border-orange-500/20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 border-b-4 border-l-4 border-orange-500/20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 border-b-4 border-r-4 border-orange-500/20"></div>
        
        {/* Diagonal Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(249,115,22,0.05)_46%,rgba(249,115,22,0.05)_54%,transparent_55%)]"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#18181b]/95 via-[#1a1a22]/95 to-[#23232b]/95"></div>
      </div>
      <main className="min-h-screen flex flex-col items-center justify-start text-white super-fade-in relative">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center pt-12 pb-8 px-4 relative overflow-hidden min-h-[300px] super-fade-in">
        {/* Animated video background */}
        <div className="absolute left-0 top-0 w-full" style={{height: '300px', overflow: 'hidden'}}>
          <video
            className="absolute left-0 top-0 w-full h-full object-cover z-0 super-fade-in"
            style={{height: '300px'}}
            src="/codm-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Multi-directional gradient overlay */}
          <div className="absolute left-0 top-0 w-full z-0" style={{
            height: '300px',
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(18, 18, 24, 0.7) 70%), linear-gradient(to bottom, rgba(249, 115, 22, 0.15) 0%, transparent 20%, transparent 80%, rgba(18, 18, 24, 0.8) 100%)',
            mixBlendMode: 'multiply'
          }} />
          {/* Vignette effect */}
          <div className="absolute left-0 top-0 w-full z-0" style={{
            height: '300px',
            boxShadow: 'inset 0 0 150px rgba(0, 0, 0, 0.9)'
          }} />
        </div>
        {/* Bottom gradient for smooth transition */}
        <div className="absolute bottom-0 left-0 w-full" style={{height: '64px'}}>
          <div className="w-full h-full bg-gradient-to-t from-[#121218] via-[#121218]/90 to-transparent z-10 pointer-events-none" />
        </div>
        
        {/* Video Attribution */}
        <div className="absolute bottom-2 right-2 z-20 text-[10px] text-gray-400 hover:text-gray-300 transition-colors duration-200">
          <a 
            href="https://pixabay.com/users/zakariacomputer222-23583455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=video&utm_content=89894" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Video by zakariacomputer222
          </a>
        </div>
        
        {/* Tagline and CTAs */}
        <div className="relative z-20 w-full flex flex-col items-center fade-in">
          <p className="text-xl sm:text-2xl md:text-4xl text-orange-400 font-extrabold mb-1 text-center drop-shadow-2xl super-glow font-['Exo_2']">Let's Chill, Play, Connect And Grow</p>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2 sm:mb-4 text-center fade-in">A home for gamers to vibe, compete, and connect. No bad energy.</p>
          <div className="flex flex-row justify-center gap-1 sm:gap-3 mb-2 sm:mb-4 super-fade-in w-full overflow-x-auto scrollbar-none">
            <Link href="/tournaments" className="super-btn bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-base md:text-lg shadow-2xl inline-flex items-center gap-1 sm:gap-2 animate-super-float font-poppins min-w-[90px] max-w-[110px] justify-center whitespace-nowrap">
              <span className="text-sm sm:text-xl"></span> Tournament
            </Link>
            <Link href="#about" className="super-btn bg-gray-800 hover:bg-orange-700 text-white px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-base md:text-lg shadow-2xl inline-flex items-center gap-1 sm:gap-2 animate-super-float font-poppins min-w-[90px] max-w-[110px] justify-center whitespace-nowrap">
              <span className="text-sm sm:text-xl"></span> About Us
            </Link>
            <Link href="/media" className="super-btn bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-base md:text-lg shadow-2xl inline-flex items-center gap-1 sm:gap-2 animate-super-float font-poppins min-w-[90px] max-w-[110px] justify-center whitespace-nowrap">
              <span className="text-sm sm:text-xl"></span> Highlights
            </Link>
            {/*<Link href="/register-identity" className="super-btn bg-orange-700 hover:bg-orange-800 text-white px-10 py-4 text-xl shadow-2xl flex items-center gap-2 animate-super-float font-poppins">
              <span className="text-2xl"></span> Register IDs
            </Link>*/}
            {/*<Link href="/edit-identity" className="super-btn bg-orange-700 hover:bg-orange-800 text-white px-10 py-4 text-xl shadow-2xl flex items-center gap-2 animate-super-float font-poppins">
              <span className="text-2xl">✏️</span> Edit IDs
            </Link>
            <Link href="/team-directory" className="super-btn bg-orange-700 hover:bg-orange-800 text-white px-10 py-4 text-xl shadow-2xl flex items-center gap-2 animate-super-float font-poppins">
              <span className="text-2xl">🧑‍🤝‍🧑</span> Cabal Members
            </Link>*/}
          </div>
        </div>
      </section>

      {/* Welcome + Mission & Vision Section */}
      <section id="about" className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 mb-6 sm:mb-8 fade-in">
        <div className="glass rounded-2xl shadow-2xl border border-orange-900/30 p-2 sm:p-4 mb-4 sm:mb-6 fade-in">
          <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-1 sm:mb-2 text-orange-400 text-center font-['Exo_2'] fade-in">Welcome to Sign Gamers</h2>
          <p className="text-gray-200 text-center leading-relaxed text-xs sm:text-sm fade-in">
            Sign Gamers is a chill, inclusive space to play, connect, and grow. We love games, so we decided, why not share what we love so others can enjoy it too and be happy? All players are welcome here. No toxicity, just pure gaming vibes.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 justify-center fade-in w-full max-w-lg mx-auto">
          {/* Mission Card */}
          <div className="glass rounded-2xl shadow-2xl border border-orange-900/20 px-2 py-3 sm:px-3 sm:py-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 w-full">
            <span className="text-xl sm:text-2xl mb-1 fade-in">🎯</span>
            <h3 className="text-sm sm:text-base font-bold text-orange-400 mb-1 drop-shadow font-['Exo_2'] super-fade-in">Our Mission</h3>
            <p className="text-gray-200 text-[11px] sm:text-xs fade-in">
              To create a welcoming, fun, and supportive gaming community where everyone can compete, connect, and belong, whether you’re a casual player, a pro, or just here for the vibes.
            </p>
          </div>
          {/* Vision Card */}
          <div className="glass rounded-2xl shadow-2xl border border-orange-900/20 px-2 py-3 sm:px-3 sm:py-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 w-full">
            <span className="text-xl sm:text-2xl mb-1 fade-in">🚀</span>
            <h3 className="text-sm sm:text-base font-bold text-orange-400 mb-1 drop-shadow font-['Exo_2'] super-fade-in">Our Vision</h3>
            <p className="text-gray-200 text-[11px] sm:text-xs fade-in">
              To become a prominent on-chain presence, hosting competitions with other communities. We aim to help gaming projects test their games, host IRL events, and bring together gamers from all over the world—both online and offline.
            </p>
          </div>
        </div>
      </section>

      {/* Games We Play Section */}
      <section id="games" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 mb-6 sm:mb-8 super-fade-in">
        <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-2 sm:mb-4 text-orange-400 drop-shadow text-center font-['Exo_2'] super-fade-in">Games We Play</h2>
        <div className="flex flex-col gap-2 sm:gap-4 md:gap-8 super-fade-in">
          {games.map((game, idx) => (
            <div key={game.id} className={`flex flex-row items-stretch gap-2 sm:gap-4 super-glass rounded-2xl shadow-2xl border border-orange-900/20 overflow-hidden transition-transform duration-300 hover:scale-[1.01] ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              {/* Left: Logo, Title, Writeup */}
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 w-1/2 min-w-0 super-fade-in">
                <img src={game.logo} alt={game.name + ' logo'} className="w-10 h-10 sm:w-12 sm:h-12 mb-1 sm:mb-2 object-contain rounded-lg bg-black/30 border border-orange-400/30 super-fade-in" />
                <h3 className="text-xs sm:text-base font-bold text-orange-400 mb-1 drop-shadow font-['Exo_2'] super-fade-in truncate w-full text-center">{game.name}</h3>
                <p className="text-gray-200 mb-1 text-[11px] sm:text-xs text-center super-fade-in line-clamp-2">{game.description}</p>
                <ul className="flex flex-wrap gap-0.5 sm:gap-1 super-fade-in justify-center">
                  {game.strengths.map((s, i) => (
                    <li key={i} className="bg-orange-700/80 text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full text-white font-semibold shadow super-fade-in">{s}</li>
                  ))}
                </ul>
              </div>
              {/* Right: Banner */}
              <div className="relative w-1/2 min-h-[70px] sm:min-h-[100px] flex items-center justify-center overflow-hidden super-fade-in">
                <img src={game.banner} alt={game.name + ' banner'} className="w-full h-full object-cover object-center rounded-none opacity-95 scale-105 transition-transform duration-500 hover:scale-110 super-fade-in" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none super-fade-in" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE FOUNDER & CO-FOUNDERS Section */}
      <section id="founders" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 mb-4 sm:mb-6 super-fade-in">
        <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-2 sm:mb-4 text-orange-400 drop-shadow text-center flex items-center justify-center gap-1 sm:gap-2 font-['Exo_2'] super-fade-in">
          <span className="text-xl sm:text-3xl md:text-5xl"></span> THE FOUNDER & CO-FOUNDERS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 sm:gap-3 md:gap-6">
          {/* Founder */}
          <div className="glass rounded-2xl shadow-2xl border-2 border-orange-400 p-1 sm:p-2 flex flex-col items-center text-center min-w-0">
            <img src="https://unavatar.io/twitter/Queenfavy99" alt="QueenFavy" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
            <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">QueenFavy</h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mb-1 font-poppins super-fade-in font-poppins">Founder</p>
            <a href="https://x.com/Queenfavy99" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@Queenfavy99</a>
            <p className="text-[9px] sm:text-xs md:text-sm text-gray-300 font-poppins super-fade-in font-poppins">Community Builder & Chaos Queen of Sign</p>
          </div>
          {/* Co-founders */}
          {[
            { name: 'Pain', handle: '0xxpain', desc: 'The Chess Titan, Game Host' },
            { name: '333', handle: 'cherrynotyours', desc: 'Intern, Game Host, Sign Sentinel' },
            { name: 'Zoe', handle: 'xoxo_zoe3', desc: 'Intern, Nano-baddie' },
            { name: 'MASHA', handle: 'whatyougondo43', desc: 'Chaos, Vibes & other Potato stuff' },
            { name: 'FransTp', handle: 'FransTp0', desc: 'Game Streaming, Support, what more could be asked of a superhero' },
          ].map((c) => (
            <div key={c.handle} className="glass rounded-2xl shadow-2xl border border-orange-900/20 p-1 sm:p-2 flex flex-col items-center text-center min-w-0">
              <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
              <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
              <p className="text-[9px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">Co-founder</p>
              <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
              <p className="text-[9px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE CONTRIBUTORS Section */}
      <section id="contributors" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 mb-6 sm:mb-8 super-fade-in">
        <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-2 sm:mb-4 text-orange-300 drop-shadow text-center flex items-center justify-center gap-1 sm:gap-2 font-['Exo_2'] super-fade-in">
          <span className="text-xl sm:text-3xl md:text-5xl"></span> CORE CONTRIBUTORS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 sm:gap-3 md:gap-6">
          {/* Spectators */}
          {[
            { name: 'SOMI', handle: 'bigsommy_', role: 'Developer', desc: 'Dev, Gamer, Sign Tech-bro' },
            { name: 'Thoth', handle: 'Trojan_Bus1', role: 'Partner', desc: 'Game Host, Support, Sensei' },
            { name: 'Biggids', handle: '_biggids', role: 'Spectator', desc: 'Support, Vibes, Community' },
            { name: 'Truth', handle: 'TruthOnchained', role: 'Spectator', desc: 'Support, Gamer, Truth of Sign' },
            { name: 'Tajudeen', handle: 'Tajudeen_10', role: 'Spectator', desc: 'King Of Sign, Gamer, Suport' },
          ].map((c) => (
            <div key={c.handle} className="glass rounded-2xl shadow-2xl border border-orange-900/20 p-1 sm:p-2 flex flex-col items-center text-center min-w-0">
              <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
              <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
              <p className="text-[9px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">{c.role}</p>
              <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
              <p className="text-[9px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
            </div>
          ))}
          {/* Partners */}
          {[
            { name: 'Zenitsu', handle: 'RudraPr86747277', role: 'Partner', desc: 'Game Host, Support' },
            { name: 'Tino', handle: 'TinoNoEnemies', role: 'Partner', desc: 'Game Host, Gamer' },
            { name: 'Toby', handle: 'toby_sign', role: 'Partner', desc: 'Game Host, Gamer' },
          ].map((c) => (
            <div key={c.handle} className="glass rounded-2xl shadow-2xl border border-orange-900/20 p-2 sm:p-4 flex flex-col items-center text-center">
              <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-orange-400 object-cover super-fade-in" />
              <h3 className="text-base sm:text-lg md:text-2xl font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
              <p className="text-[10px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">{c.role}</p>
              <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[10px] sm:text-xs md:text-base mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
              <p className="text-[10px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest from the Cabal Section */}
      <LatestBlogPosts />

      {/* Latest Media Section */}
      <LatestMedia />

      {/* Quick Navigation Footer */}
      <footer className="w-full bg-[#18181b] border-t border-orange-900/40 mt-12 py-3 px-2 flex flex-row items-center justify-between gap-2 sticky bottom-0 z-20 shadow-2xl super-fade-in">
        <div className="flex flex-row items-center gap-4">
          <Link href="/tournaments" className="text-orange-400 hover:text-orange-300 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors duration-200">
            <span>Tournaments</span>
          </Link>
          <a href="discord.gg/vsw8nm7qtk" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors duration-200">
            <span>Discord</span>
          </a>
        </div>
        <div className="flex flex-row items-center gap-4">
          <a href="https://twitter.com/sign" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors duration-200">
            <span>Orange Dynasty</span>
          </a>
          <a href="https://sign.global" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors duration-200">
            <span>Sign Protocol</span>
          </a>
        </div>
      </footer>
      </main>
    </div>
  );
}
