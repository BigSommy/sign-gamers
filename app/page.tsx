

"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { games } from './gamesData';
import LatestBlogPosts from './LatestBlogPosts';
import LatestMedia from './components/LatestMedia';
import Footer from '@/components/Footer';
import FeaturedTournamentCarousel from '@/components/FeaturedTournamentCarousel';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from "framer-motion";
import { FaTrophy, FaGamepad, FaUser, FaArrowDown } from 'react-icons/fa';
import AnimatedWords from '@/components/AnimatedWords';
import { HelpCircle, Gamepad2 } from "lucide-react";
import { AiFillHome } from 'react-icons/ai';
import { MdLeaderboard } from 'react-icons/md';
import { BsFolderFill } from 'react-icons/bs';
import BackgroundFX from '@/components/BackgroundFX';


// Card border/animation utility classes
const cardMotion = {
  initial: { opacity: 0, scale: 0.96, y: 24 },
  whileInView: { opacity: 1, scale: 1, y: 0 },
  whileHover: { scale: 1.04, boxShadow: '0 0 32px 4px #f23900cc', borderColor: '#f23900' },
  transition: { duration: 0.5, ease: 'easeOut' }
};

// About Tabs Component
function Tabs() {
  const [tab, setTab] = useState<'mission'|'vision'>('mission');
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          className={`px-4 py-1 rounded-t-lg font-bold text-sm transition-colors duration-200 border-b-2 ${tab==='mission' ? 'text-orange-400 border-orange-400 bg-[#18181b]' : 'text-gray-400 border-transparent bg-transparent hover:text-orange-300'}`}
          onClick={()=>setTab('mission')}
        >Mission</button>
        <button
          className={`px-4 py-1 rounded-t-lg font-bold text-sm transition-colors duration-200 border-b-2 ${tab==='vision' ? 'text-orange-400 border-orange-400 bg-[#18181b]' : 'text-gray-400 border-transparent bg-transparent hover:text-orange-300'}`}
          onClick={()=>setTab('vision')}
        >Vision</button>
      </div>
      <div className="rounded-b-xl bg-[#18181b] border border-orange-400/20 p-4 min-h-[80px]">
        {tab==='mission' ? (
          <div className="flex items-start gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-lg font-bold text-orange-400 mb-1 font-['Exo_2']">Our Mission</h3>
              <p className="text-gray-200 text-base">
                To create a welcoming, fun, and supportive gaming community where everyone can compete, connect, and belong, whether you’re a casual player, a pro, or just here for the vibes.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span className="text-2xl">🚀</span>
            <div>
              <h3 className="text-lg font-bold text-orange-400 mb-1 font-['Exo_2']">Our Vision</h3>
              <p className="text-gray-200 text-base">
                To become a prominent on-chain presence, hosting competitions with other communities. We aim to help gaming projects test their games, host IRL events, and bring together gamers from all over the world—both online and offline.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ...rest of the page component code...

export default function Home() {
  const [showContent, setShowContent] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  type Tournament = {
    id: string;
    title: string;
    description: string;
    status: 'upcoming' | 'ongoing' | 'past';
    banner_url: string | null;
    register_link: string | null;
    registration_deadline?: string;
    end_date?: string;
  };
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  // Fetch tournaments and group/filter as on tournaments page
  React.useEffect(() => {
    let isMounted = true;
    async function fetchTournaments() {
      setLoadingTournaments(true);
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      if (!isMounted) return;
      const now = new Date();
      // Helper to match tournaments page logic
      function getStatus(t: Tournament) {
        const dateStr = t.end_date || t.registration_deadline;
        if (dateStr) {
          const end = new Date(dateStr);
          if (end < now) return 'past';
        }
        return t.status;
      }
      // Only show upcoming tournaments (for carousel)
      const upcoming = (data || []).filter((t: Tournament) => getStatus(t) === 'upcoming');
      setTournaments(upcoming);
      setLoadingTournaments(false);
    }
    fetchTournaments();
    return () => { isMounted = false; };
  }, []);

  // Back to Top Button scroll logic
  React.useEffect(() => {
    function handleScroll() {
      const btn = document.getElementById('backToTopBtn');
      if (!btn) return;
      if (window.scrollY > window.innerHeight * 0.5) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
      } else {
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Global Animated Background */}
      <BackgroundFX/>
      {/* HERO SECTION: Animated, with video, overlay, animated words, CTAs, floating icons, featured tournament mini-card, scroll-down indicator */}
      <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center overflow-hidden snap-start">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-80 pointer-events-none select-none"
          src="/codm-bg1.mp4"
        />
        {/* Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f23900cc] via-transparent to-transparent z-10 pointer-events-none" />
        {/* Floating Game Icons */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <FaTrophy className="absolute left-10 top-10 text-orange-400/80 text-4xl animate-float-slow" />
          <FaGamepad className="absolute right-10 top-24 text-orange-300/70 text-3xl animate-float" />
          <FaUser className="absolute left-1/4 bottom-16 text-orange-200/70 text-2xl animate-float-reverse" />
        </div>
        {/* Main Content */}
        <div className="relative z-30 flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center">
          <img src="/logo.png" alt="Sign Gamers Logo" className="w-28 h-28 sm:w-40 sm:h-40 object-contain drop-shadow-[0_0_24px_#f23900bb] border border-[#f23900] mx-auto mb-4" draggable="false" />
          <h1 className="text-2xl sm:text-3xl md:text-6xl font-semibold text-white mb-2 font-['Exo_2'] drop-shadow-lg">
            <AnimatedWords
              words={["Sign Gamers", "Play. Compete. Connect.", "On-chain Gaming", "Tournaments & Vibes"]}
              className="inline-block text-orange-400"
            />
          </h1>
          <p className="text-lg sm:text-2xl text-orange-100 font-semibold mb-6 max-w-2xl mx-auto drop-shadow">
            Where gamers unite, compete, and vibe. All skill levels welcome. No toxicity, just pure gaming energy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="#about" className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition-all duration-200">Learn More</Link>
            <Link href="/tournaments" className="px-6 py-3 rounded-full bg-white/90 hover:bg-orange-100 text-orange-600 font-bold text-lg shadow-lg transition-all duration-200">Join a Tournament</Link>
          </div>
          
          {/* Scroll Down Indicator */}
          <div className="flex flex-col items-center mt-4 animate-bounce">
            <FaArrowDown className="text-orange-400 text-3xl" />
            <span className="text-orange-200 text-xs mt-1">Scroll Down</span>
          </div>
        </div>
        <style>{`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-16px); }
            100% { transform: translateY(0); }
          }
          @keyframes float-slow {
            0% { transform: translateY(0); }
            50% { transform: translateY(-24px); }
            100% { transform: translateY(0); }
          }
          @keyframes float-reverse {
            0% { transform: translateY(0); }
            50% { transform: translateY(12px); }
            100% { transform: translateY(0); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
          .animate-float-reverse { animation: float-reverse 4s ease-in-out infinite; }
        `}</style>
      </section>
      <div
        className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-20 sm:py-32 mb-20 sm:mb-28 fade-in relative min-h-[420px] snap-start"
        data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000"
      >
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row items-center bg-[#18181b] border border-[#f23900] rounded-3xl shadow-2xl animate-border overflow-hidden">
            {/* Left: Illustration */}
            <div className="flex-shrink-0 flex items-center justify-center w-full sm:w-1/3 h-40 sm:h-64">
              <img
                src="/logo1.png"
                alt="Sign Gamers Logo"
                className="w-28 h-28 sm:w-40 sm:h-40 object-contain drop-shadow-[0_0_24px_#f23900bb]"
                draggable="false"
              />
            </div>
            {/* Right: Text & Tabs */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-10">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-orange-400 font-['Exo_2'] flex items-center gap-2"><span className="text-3xl">👋</span>Welcome to Sign Gamers</h2>
              <p className="text-gray-200 leading-relaxed text-base sm:text-lg mb-4 max-w-2xl">
                Sign Gamers is a chill, inclusive space to play, connect, and grow. We love games, so we decided, why not share what we love so others can enjoy it too and be happy? All players are welcome here. No toxicity, just pure gaming vibes.
              </p>
              {/* Tabs for Mission/Vision */}
              <div className="w-full">
                <Tabs />
              </div>
            </div>
          </div>
        </motion.section>
      </div>
        {/* Featured Tournament Carousel (moved below About) */}
        <div className="w-full">
          {loadingTournaments ? (
            <div className="w-full flex items-center justify-center py-12">
              <span className="text-orange-400 animate-pulse text-lg font-bold">Loading tournaments...</span>
            </div>
          ) : tournaments.length > 0 ? (
            <FeaturedTournamentCarousel tournaments={tournaments} />
          ) : null}
        </div>
        {/* Games We Play Section */}
        <div
          className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-10 sm:py-20 mb-10 sm:mb-16 super-fade-in min-h-screen snap-start"
          data-aos="fade-up" data-aos-duration="1000"
        >
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
          <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-6 sm:mb-10 text-orange-400 drop-shadow text-center font-['Exo_2'] super-fade-in">Games We Play</h2>
          <div className="flex flex-col gap-6 sm:gap-6 md:gap-10 super-fade-in">
            {games.map((game, idx) => (
              <div
                key={game.id}
                className={`flex flex-col sm:flex-row items-stretch gap-0 sm:gap-0 rounded-2xl shadow-2xl border-2 border-orange-600 animate-border super-float overflow-hidden transition-transform duration-300 group max-w-xs sm:max-w-none mx-auto sm:mx-0`}
                data-aos="fade-up" data-aos-duration="800" data-aos-delay={idx * 120}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 24 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 32px 4px #f23900cc', borderColor: '#f23900' }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                {/* Left: Logo, Title, Writeup */}
                <div className="flex flex-col items-center justify-center bg-[#18181b] px-2 sm:p-6 w-full sm:w-1/2 min-w-0 super-fade-in">
                  <img src={game.logo} alt={game.name + ' logo'} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 object-contain rounded-lg border border-orange-400/30 super-fade-in" />
                  <h3 className="text-base sm:text-lg font-bold text-orange-400 mb-1 drop-shadow font-['Exo_2'] super-fade-in truncate w-full text-center">{game.name}</h3>
                  <p className="text-gray-200 mb-2 text-xs sm:text-sm text-center super-fade-in line-clamp-2">{game.description}</p>
                  <ul className="flex flex-wrap gap-2  sm:gap-2 super-fade-in justify-center mt-1">
                    {game.strengths.map((s, i) => (
                      <li key={i} className="bg-[#f23900] text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-semibold shadow-md border border-orange-200/40 super-fade-in" style={{textShadow: '0 1px 2px #b32a00'}}>{s}</li>
                    ))}
                  </ul>
                </div>
                {/* Right: Banner */}
                <div className="relative w-full sm:w-1/2 aspect-[2.8/1] sm:aspect-[2.8/1] min-h-[120px] flex items-center justify-center overflow-hidden super-fade-in">
                  <img src={game.banner} alt={game.name + ' banner'} className="w-full h-full object-cover object-center rounded-none opacity-95 scale-105 transition-transform duration-500 group-hover:scale-110 super-fade-in" />
                  <div className="absolute inset-0 pointer-events-none super-fade-in" />
                </div>
                </motion.div>
              </div>
            ))}
          </div>
          </motion.section>
        </div>

        {/* THE FOUNDER & CO-FOUNDERS Section */}
        <div
          className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-16 mb-6 sm:mb-10 super-fade-in min-h-screen snap-start"
          data-aos="fade-up" data-aos-duration="1000"
        >
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
          <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-2 sm:mb-4 text-orange-400 drop-shadow text-center flex items-center justify-center gap-1 sm:gap-2 font-['Exo_2'] super-fade-in">
            <span className="text-xl sm:text-3xl md:text-5xl"></span> THE FOUNDER & CO-FOUNDERS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 sm:gap-3 md:gap-6">
            {/* Founder */}
          <div className="rounded-2xl shadow-2xl border-2 bg-[#18181b] border-orange-600 p-1 sm:p-2 flex flex-col items-center text-center min-w-0" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
              <img src="https://unavatar.io/twitter/Queenfavy99" alt="QueenFavy" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
              <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">QueenFavy</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mb-1 font-poppins super-fade-in">Founder</p>
              <a href="https://x.com/Queenfavy99" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@Queenfavy99</a>
              <p className="text-[9px] sm:text-xs md:text-sm text-gray-300 font-poppins super-fade-in">Community Builder & Chaos Queen of Sign</p>
            </div>
            {/* Co-founders */}
            {[
              { name: 'Pain', handle: '0xxpain', desc: 'The Chess Titan, Game Host' },
              { name: '333', handle: 'cherrynotyours', desc: 'Intern, Game Host, Sign Sentinel' },
              { name: 'Zoe', handle: 'xoxo_zoe3', desc: 'Intern, Nano-baddie' },
              { name: 'MASHA', handle: 'whatyougondo43', desc: 'Chaos, Vibes & other Potato stuff' },
              { name: 'FransTp', handle: 'FransTp0', desc: 'Game Streaming, Support, what more could be asked of a superhero' },
            ].map((c, i) =>
            (<div key={c.handle} className="rounded-2xl bg-[#18181b] shadow-2xl border border-orange-600 p-1 sm:p-2 flex flex-col items-center text-center min-w-0 transition-transform duration-300 hover:scale-105" data-aos="fade-up" data-aos-duration="800" data-aos-delay={(1 + i) * 120}>
                <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
                <p className="text-[9px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">Co-founder</p>
                <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
                <p className="text-[9px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
              </div>
            ))}
          </div>
          </motion.section>
        </div>

        {/* CORE CONTRIBUTORS Section */}
        <div
          className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-16 mb-6 sm:mb-10 super-fade-in min-h-screen snap-start"
          data-aos="fade-up" data-aos-duration="1000"
        >
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
          <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-2 sm:mb-4 text-orange-400 drop-shadow text-center flex items-center justify-center gap-1 sm:gap-2 font-['Exo_2'] super-fade-in">
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
            ].map((c, i) => 
            (<div key={c.handle} className="glass rounded-2xl shadow-2xl bg-[#18181b] border border-orange-600 p-1 sm:p-2 flex flex-col items-center text-center min-w-0 transition-transform duration-300 hover:scale-105" data-aos="fade-up" data-aos-duration="800" data-aos-delay={i * 120}>
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
            ].map((c, i) => 
            (<div key={c.handle} className="rounded-2xl shadow-2xl bg-[#18181b] border border-orange-600 p-2 sm:p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105" data-aos="fade-up" data-aos-duration="800" data-aos-delay={i * 120}>
                <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-orange-400 object-cover super-fade-in" />
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
                <p className="text-[10px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">{c.role}</p>
                <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[10px] sm:text-xs md:text-base mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
                <p className="text-[10px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
              </div>
            ))}
          </div>
          </motion.section>
        </div>

        {/* Latest from the Cabal Section */}
        <div
          className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-16 mb-8 sm:mb-12 super-fade-in min-h-screen snap-start"
        >
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
          <LatestBlogPosts />
          </motion.section>
        </div>
        {/* Latest Media Section */}
        <div
          className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-16 mb-8 sm:mb-12 super-fade-in min-h-screen snap-start"
        >
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
          <LatestMedia />
          </motion.section>
        </div>
        {/* Minimalistic Footer */}
        <Footer />
        {/* Back to Top Button */}
        <button
          id="backToTopBtn"
          className="fixed bottom-6 left-6 z-40 bg-[#18181b] text-[#f23900] border-2 border-[#f23900] rounded-full p-3 shadow-2xl hover:bg-[#f23900] hover:text-white transition-all duration-200 flex items-center justify-center opacity-0 pointer-events-none"
          style={{transition: 'opacity 0.3s'}}
          aria-label="Back to Top"
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4c.414 0 .75.336.75.75v12.19l4.72-4.72a.75.75 0 1 1 1.06 1.06l-6 6a.75.75 0 0 1-1.06 0l-6-6a.75.75 0 1 1 1.06-1.06l4.72 4.72V4.75c0-.414.336-.75.75-.75Z"/></svg>
        </button>
      {/* Remove stray closing main tag */}
      {/* Floating FAQ Button & Card */}
      <div className="fixed z-50 bottom-28 right-6 flex flex-col items-end">
        {/* FAQ Card */}
        <AnimatePresence>
          {faqOpen && (
            <div className="mb-3 w-80 max-w-xs sm:max-w-sm bg-[#1f2937] text-white rounded-2xl shadow-2xl border border-orange-500/40 p-4 relative" style={{ boxShadow: "0 8px 32px 0 #000a, 0 0 0 2px #f97316aa" }}>
              <motion.div
                /* id="faqCard" */
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Close button */}
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-orange-400 text-lg font-bold focus:outline-none"
                  onClick={() => setFaqOpen(false)}
                  aria-label="Close FAQ"
                  tabIndex={0}
                >
                  ×
                </button>
                <h3 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2"><HelpCircle size={20} /> FAQ</h3>
                <div className="space-y-2">
                  <details className="bg-[#111827] rounded-lg p-2">
                    <summary className="cursor-pointer font-semibold text-orange-300">What is Sign Gamers?</summary>
                    <div className="mt-1 text-sm text-gray-100">Sign Gamers is a chill, inclusive gaming community for everyone—casuals, pros, and all in between. We host games, tournaments, and more!</div>
                  </details>
                  <details className="bg-[#111827] rounded-lg p-2">
                    <summary className="cursor-pointer font-semibold text-orange-300">How do I join tournaments?</summary>
                    <div className="mt-1 text-sm text-gray-100">Just click the "Tournament" button and register for the tournament or join our Discord for help and announcements.</div>
                  </details>
                  <details className="bg-[#111827] rounded-lg p-2">
                    <summary className="cursor-pointer font-semibold text-orange-300">Is it free to join?</summary>
                    <div className="mt-1 text-sm text-gray-100">Yes! All our community events and games are free to join. Some special events may have extra requirements, but most are open to all.</div>
                  </details>
                  <details className="bg-[#111827] rounded-lg p-2">
                    <summary className="cursor-pointer font-semibold text-orange-300">Where can I get support?</summary>
                    <div className="mt-1 text-sm text-gray-100">Hop into our Discord or DM us on Twitter/X for Help, uestions, Partnerships, Collaborations, or just to say hi!</div>
                  </details>
                  <details className="bg-[#111827] rounded-lg p-2">
                    <summary className="cursor-pointer font-semibold text-orange-300">How to Get the Uniue Code?</summary>
                    <div className="mt-1 text-sm text-gray-100">Just click on the "Register Game IDs", then submit your X handle and Game ID for the games you play. You will recieve a code afterwards. This code will be used to EDIT your GAME DATA in the future and to register for tournaments. This wil only be used for tournaments with 1v1 matches</div>
                  </details>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Floating Button */}
        <button
          id="faqBtn"
          className="bg-orange-400 hover:bg-orange-500 text-white rounded-full shadow-2xl w-14 h-14 flex items-center justify-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-200 animate-faq-pulse"
          style={{ boxShadow: "0 4px 24px #f97316aa" }}
          onClick={() => setFaqOpen((v) => !v)}
          aria-label="Open FAQ"
        >
          <HelpCircle size={32} />
        </button>
        <style>{`
          @keyframes faq-pulse {
            0% { box-shadow: 0 0 0 0 #f9731640; }
            70% { box-shadow: 0 0 0 12px #f9731600; }
            100% { box-shadow: 0 0 0 0 #f9731600; }
          }
          .animate-faq-pulse {
            animation: faq-pulse 1.5s infinite;
          }
        `}</style>
      </div>
    </>
  );
}
