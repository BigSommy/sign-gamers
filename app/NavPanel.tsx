"use client";
import React, { useState } from 'react';
import { HomeIcon, TrophyIcon, ChartBarIcon, UsersIcon, FilmIcon, NewspaperIcon, InformationCircleIcon, LightBulbIcon, HeartIcon } from '@heroicons/react/24/solid';

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <a 
      href={href} 
      className={`${className} font-['Exo_2']`}
    >
      {children}
    </a>
  );
}

function NavDivider() {
  return <hr className="nav-divider" />;
}

export default function NavPanel({ navOpen, setNavOpen }: { navOpen: boolean, setNavOpen: (open: boolean) => void }) {

  return (
    <>
      {/* Navigation panel - redesigned */}
      <nav
        className={`fixed top-0 right-0 h-full max-w-xs w-full sm:w-80 bg-[#18181b] shadow-2xl border-l border-orange-900/40 z-50 flex flex-col items-center pt-8 px-0 transition-transform duration-300 ease-in-out ${navOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ pointerEvents: navOpen ? "auto" : "none", overflowY: 'auto' }}
      >
        {/* Close button */}
        <button
          aria-label="Close navigation"
          className="absolute top-6 right-6 text-orange-400 hover:text-orange-300 transition-colors duration-200 p-1"
          onClick={() => setNavOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-extrabold text-orange-400 mb-8 px-6 text-left font-['Exo_2']">Welcome!</h2>
        <div className="flex flex-col w-full gap-2 px-4">
          <NavLink 
            href="/" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <HomeIcon className="h-5 w-5 text-orange-400" />
            <span>Home</span>
          </NavLink>
          
          <NavLink 
            href="/tournaments" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <TrophyIcon className="h-5 w-5 text-orange-400" />
            <span>Tournaments</span>
          </NavLink>
          
          <NavLink 
            href="/leaderboard" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <ChartBarIcon className="h-5 w-5 text-orange-400" />
            <span>Leaderboard</span>
          </NavLink>
         <NavLink 
           href="/gamers" 
           className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
         >
           <UsersIcon className="h-5 w-5 text-orange-400" />
           <span>Gamers</span>
         </NavLink>
          
            <NavLink 
              href="/community" 
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
            >
              <InformationCircleIcon className="h-5 w-5 text-orange-400" />
              <span>Community</span>
            </NavLink>
          
          <NavLink 
            href="/media" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <FilmIcon className="h-5 w-5 text-orange-400" />
            <span>Highlights</span>
          </NavLink>
          
          <NavLink 
            href="/blog" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <NewspaperIcon className="h-5 w-5 text-orange-400" />
            <span>Blog</span>
          </NavLink>
          
          <NavLink 
            href="/donation" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <HeartIcon className="h-5 w-5 text-orange-400" />
            <span>Donate</span>
          </NavLink>
          
          <NavLink 
            href="/games" 
            className="flex items-center gap-3 py-3 px-4 rounded-lg text-white font-bold bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 transition-all duration-200"
          >
            <svg 
              className="h-5 w-5 text-orange-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.75 3L12 1.5L14.25 3M9.75 21L12 22.5L14.25 21M3 12H21M1.5 7.5H22.5M1.5 16.5H22.5M5.25 7.5V16.5M18.75 7.5V16.5M9 12H9.75M14.25 12H15" 
              />
            </svg>
            <span>Sign Games</span>
          </NavLink>
        </div>
        <style jsx>{`
          .nav-link {
            display: block;
            font-size: 1.08rem;
            font-weight: 500;
            color: #fb923c;
            padding: 0.65rem 1.5rem;
            border-radius: 0.5rem;
            background: none;
            margin: 0;
            transition: background 0.18s, color 0.18s;
            text-align: left;
          }
          .nav-link:hover {
            background: #fb923c22;
            color: #fff;
          }
          .nav-divider {
            height: 1px;
            background: #fb923c33;
            margin: 0 1.5rem;
            border: none;
          }
          nav {
            width: 100%;
            max-width: 20rem;
            min-width: 16rem;
          }
          @media (max-width: 600px) {
            nav {
              width: 70vw !important;
              min-width: 0 !important;
              max-width: 70vw !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            .nav-link {
              font-size: 1rem;
              padding: 0.5rem 1rem;
            }
          }
        `}</style>
      </nav>
    </>
  );
}
