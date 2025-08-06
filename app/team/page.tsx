"use client";

import Link from 'next/link';
import { motion } from "framer-motion";

export default function TeamPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start text-white super-fade-in relative overflow-y-auto snap-y snap-mandatory bg-[#18181b] z-0">
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-16 mb-6 sm:mb-10 super-fade-in min-h-screen snap-start">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-8 text-orange-400 drop-shadow text-center font-['Exo_2']">Meet the Team</h1>
        {/* THE FOUNDER & CO-FOUNDERS Section */}
        <div id="founders" className="mb-16">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
          <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold mb-2 sm:mb-4 text-orange-400 drop-shadow text-center flex items-center justify-center gap-1 sm:gap-2 font-['Exo_2'] super-fade-in">
            <span className="text-xl sm:text-3xl md:text-5xl"></span> THE FOUNDER & CO-FOUNDERS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 sm:gap-3 md:gap-6 relative z-10">
            {/* Founder */}
            <div className="glass rounded-2xl shadow-2xl border-8 border-[#f23900] animate-border super-float p-1 sm:p-2 flex flex-col items-center text-center min-w-0" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="0">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 32px 4px #f23900cc', borderColor: '#f23900' }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <img src="https://unavatar.io/twitter/Queenfavy99" alt="QueenFavy" className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">QueenFavy</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mb-1 font-poppins super-fade-in">Founder</p>
                <a href="https://x.com/Queenfavy99" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@Queenfavy99</a>
                <p className="text-[9px] sm:text-xs md:text-sm text-gray-300 font-poppins super-fade-in">Community Builder & Chaos Queen of Sign</p>
              </motion.div>
            </div>
            {/* Co-founders */}
            {[ 
              { name: 'Pain', handle: '0xxpain', desc: 'The Chess Titan, Game Host' },
              { name: '333', handle: 'cherrynotyours', desc: 'Intern, Game Host, Sign Sentinel' },
              { name: 'Zoe', handle: 'xoxo_zoe3', desc: 'Intern, Nano-baddie' },
              { name: 'MASHA', handle: 'whatyougondo43', desc: 'Chaos, Vibes & other Potato stuff' },
              { name: 'FransTp', handle: 'FransTp0', desc: 'Game Streaming, Support, what more could be asked of a superhero' },
            ].map((c, i) =>
              <div key={c.handle} className="glass rounded-2xl shadow-2xl border-8 border-[#f23900] animate-border super-float p-1 sm:p-2 flex flex-col items-center text-center min-w-0 transition-transform duration-300" data-aos="fade-up" data-aos-duration="800" data-aos-delay={(1 + i) * 120}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 24 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 32px 4px #f23900cc', borderColor: '#f23900' }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
                  <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
                  <p className="text-[9px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">Co-founder</p>
                  <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
                  <p className="text-[9px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
                </motion.div>
              </div>
            )}
          </div>
          </motion.section>
        </div>
        {/* CORE CONTRIBUTORS Section */}
        <div id="contributors" className="mb-16">
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
              <div key={c.handle} className="glass rounded-2xl shadow-2xl border border-orange-900/20 p-1 sm:p-2 flex flex-col items-center text-center min-w-0 transition-transform duration-300 hover:scale-105" data-aos="fade-up" data-aos-duration="800" data-aos-delay={i * 120}>
                <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full mb-1 sm:mb-2 md:mb-2 border-2 border-orange-400 object-cover super-fade-in" />
                <h3 className="text-xs sm:text-base md:text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
                <p className="text-[9px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">{c.role}</p>
                <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[9px] sm:text-xs md:text-sm mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
                <p className="text-[9px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
              </div>
            )}
            {/* Partners */}
            {[
              { name: 'Zenitsu', handle: 'RudraPr86747277', role: 'Partner', desc: 'Game Host, Support' },
              { name: 'Tino', handle: 'TinoNoEnemies', role: 'Partner', desc: 'Game Host, Gamer' },
              { name: 'Toby', handle: 'toby_sign', role: 'Partner', desc: 'Game Host, Gamer' },
            ].map((c, i) => 
              <div key={c.handle} className="glass rounded-2xl shadow-2xl border border-orange-900/20 p-2 sm:p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105" data-aos="fade-up" data-aos-duration="800" data-aos-delay={i * 120}>
                <img src={`https://unavatar.io/twitter/${c.handle}`} alt={c.name} className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full mb-1 sm:mb-2 md:mb-3 border-2 border-orange-400 object-cover super-fade-in" />
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-orange-400 mb-1 font-['Exo_2'] super-fade-in">{c.name}</h3>
                <p className="text-[10px] sm:text-xs md:text-gray-400 mb-1 super-fade-in">{c.role}</p>
                <a href={`https://x.com/${c.handle}`} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline text-[10px] sm:text-xs md:text-base mb-1 sm:mb-2 super-fade-in">@{c.handle}</a>
                <p className="text-[10px] sm:text-xs md:text-gray-300 super-fade-in">{c.desc}</p>
              </div>
            )}
          </div>
          </motion.section>
        </div>
      </section>
      <div className="w-full flex justify-center mt-8">
        <Link href="/" className="super-btn bg-[#f23900] hover:bg-orange-600 text-white px-7 py-3 text-base sm:text-lg shadow-2xl rounded-xl border-2 border-[#f23900] font-bold transition-transform duration-200">Back to Home</Link>
      </div>
    </main>
  );
}
