'use client'

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

export default function Header({ navOpen, setNavOpen }: { navOpen: boolean, setNavOpen: (open: boolean) => void }) {
  const { user, profile, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#18181b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="Sign Gamers Logo" className="h-9 w-9 md:h-11 border border-[#f23900] md:w-11 rounded-lg shadow" />
            <span className="text-lg md:text-2xl font-extrabold text-orange-400 drop-shadow font-['Exo_2']">Sign Gamers</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Social Media Link */}
            <a 
              href="https://x.com/signgamers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/30 hidden sm:inline-block"
              style={{ minWidth: 0 }}
            >
              JOIN US
            </a>

            {/* Authentication Section */}
            {!loading && (
              <>
                {user ? (
                  /* User Menu */
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-white px-3 py-2 rounded-lg transition-all duration-200 border border-gray-600 hover:border-orange-400"
                    >
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                        {profile?.profile_picture_url ? (
                          <img 
                            src={profile.profile_picture_url} 
                            alt={profile.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-white text-sm" />
                        )}
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {profile?.username || user.email?.split('@')[0]}
                      </span>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#222] rounded-lg shadow-xl border border-gray-600 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-600">
                          <p className="text-sm font-medium text-white">
                            {profile?.username || user.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser className="text-sm" />
                          Profile
                        </Link>
                        
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog className="text-sm" />
                          Settings
                        </Link>
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors w-full text-left"
                        >
                          <FaSignOutAlt className="text-sm" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Sign In/Sign Up Buttons */
                  <div className="flex items-center gap-2">
                    <Link
                      href="/auth/signin"
                      className="bg-transparent hover:bg-gray-700 text-white font-semibold py-1 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-200 border border-gray-600 hover:border-orange-400"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 md:px-4 rounded-full text-xs md:text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-orange-500/30"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

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