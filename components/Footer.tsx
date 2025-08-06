import React from "react";
import Link from "next/link";
import { FaTwitter, FaDiscord, FaGlobe, FaFileAlt, FaTelegramPlane } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="w-full bg-[#18181b] border-t border-gray-700 text-white flex flex-col items-center justify-center relative z-30 pb-20 sm:pb-0"
      style={{ minHeight: 60, fontFamily: 'Exo_2, sans-serif' }}
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between px-4 py-3 md:py-4 gap-6">
        
        {/* Left: Logo/Site Name */}
        <div className="flex flex-col items-start justify-center min-w-[90px]">
          <span className="text-base md:text-lg font-bold text-orange-400 tracking-wide select-none">
            Sign Gamers
          </span>
          <span className="text-[10px] text-gray-400 mt-1">
            © {new Date().getFullYear()} Sign Gamers
          </span>
        </div>

        {/* Center: Sign Protocol Links */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm md:text-base font-semibold text-white">
            Sign Protocol
          </span>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://sign.global"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-300 hover:text-orange-400 transition-colors duration-150 text-sm"
            >
              <FaGlobe /> Website
            </a>
            <a
              href="https://sign.global/orange-dynasty/orange-print"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-300 hover:text-orange-400 transition-colors duration-150 text-sm"
            >
              <FaFileAlt /> OrangePrint
            </a>
            <a
              href="https://twitter.com/sign"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-300 hover:text-orange-400 transition-colors duration-150 text-sm"
            >
              <FaTwitter /> Twitter
            </a>
            <a
              href="https://t.me/orangedynasty"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-300 hover:text-orange-400 transition-colors duration-150 text-sm"
            >
              <FaTelegramPlane /> Telegram
            </a>
          </div>
        </div>

        {/* Right: Sign Gamers Socials */}
        <div className="flex flex-col items-center gap-2 min-w-[90px]">
          <span className="text-sm md:text-base font-semibold text-white">
            Sign Gamers
          </span>
          <div className="flex flex-row items-center gap-3">
            <a
              href="https://twitter.com/signgamers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-orange-400 transition-colors duration-150 text-sm"
            >
              <FaTwitter /> Twitter
            </a>
            <a
              href="https://discord.gg/vsw8nm7qtk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-400 hover:text-orange-400 transition-colors duration-150 text-sm"
            >
              <FaDiscord /> Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
