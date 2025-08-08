
"use client";
import { AiFillHome } from 'react-icons/ai';
import { FaTrophy, FaGamepad } from 'react-icons/fa';
import { MdLeaderboard } from 'react-icons/md';
import { BsFolderFill } from 'react-icons/bs';

// Sticky Bottom Mobile Nav for all pages
function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#18181b] border-t border-orange-900/40 flex sm:hidden justify-around items-center py-2 shadow-2xl" style={{boxShadow:'0 -2px 16px #0008'}}>
      <a href="/" className="flex flex-col items-center justify-center text-orange-400 hover:text-white text-xs font-semibold px-2 transition-all duration-200 hover:drop-shadow-[0_0_8px_#f23900] focus:drop-shadow-[0_0_8px_#f23900]">
        <AiFillHome size={24} />
        <span className="text-[10px] mt-1">Home</span>
      </a>
      <a href="/tournaments" className="flex flex-col items-center justify-center text-orange-400 hover:text-white text-xs font-semibold px-2 transition-all duration-200 hover:drop-shadow-[0_0_8px_#f23900] focus:drop-shadow-[0_0_8px_#f23900]">
        <FaGamepad size={22} />
        <span className="text-[10px] mt-1">Tournaments</span>
      </a>
      <a href="/leaderboard" className="flex flex-col items-center justify-center text-orange-400 hover:text-white text-xs font-semibold px-2 transition-all duration-200 hover:drop-shadow-[0_0_8px_#f23900] focus:drop-shadow-[0_0_8px_#f23900]">
        <MdLeaderboard size={22} />
        <span className="text-[10px] mt-1">Leaderboard</span>
      </a>
      <a href="/blog" className="flex flex-col items-center justify-center text-orange-400 hover:text-white text-xs font-semibold px-2 transition-all duration-200 hover:drop-shadow-[0_0_8px_#f23900] focus:drop-shadow-[0_0_8px_#f23900]">
        <BsFolderFill size={22} />
        <span className="text-[10px] mt-1">Blog</span>
      </a>
      <a href="/games" className="flex flex-col items-center justify-center text-orange-400 hover:text-white text-xs font-semibold px-2 transition-all duration-200 hover:drop-shadow-[0_0_8px_#f23900] focus:drop-shadow-[0_0_8px_#f23900]">
        <FaTrophy size={22} />
        <span className="text-[10px] mt-1">Games</span>
      </a>
    </nav>
  );
}
import './globals.css';
import { Inter } from 'next/font/google';
import BackgroundFX from '@/components/BackgroundFX';
import ClientLayout from './ClientLayout';
import AOSInit from './AOSInit';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <BackgroundFX />
        <AOSInit />
        <ClientLayout>{children}</ClientLayout>
        <MobileBottomNav />
      </body>
    </html>






  );
}
