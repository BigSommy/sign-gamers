'use client';

import { useState } from 'react';

// Placeholder wallet address, replace with real one
const WALLET_ADDRESS = '0xA03B160CCf681D79525950a550b1287a14E20281';

const TOKENS = [
  { name: 'Ethereum', symbol: 'ETH', icon: '/tokens/eth.png' },
  { name: 'Sign (Base Chain)', symbol: 'SIGN', icon: '/tokens/sign.png' },
  // Add more tokens as needed
];

export default function DonationPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#18181b] via-[#1a1a22] to-[#23232b] flex flex-col items-center justify-center px-2 md:px-4 py-10">
      <div className="w-full max-w-lg bg-[#18181b] relative z-10 rounded-2xl shadow-2xl border border-orange-900/30 p-6 md:p-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-orange-400 mb-4 text-center">Support the Cabal</h1>
        <p className="text-gray-300 text-center mb-6 text-base md:text-lg">
          If you love what we do and want to support Sign Gamers, you can donate any EVM-compatible token. All contributions help us grow the community, host events, and keep the vibes strong!
        </p>
        <div className="w-full flex flex-col items-center gap-2 mb-6">
          <span className="text-orange-300 font-semibold text-sm mb-1">EVM Wallet Address</span>
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={WALLET_ADDRESS}
              readOnly
              className="w-full px-3 py-2 rounded bg-black/40 text-white font-mono text-xs md:text-sm border border-orange-900/30 select-all"
            />
            <button
              onClick={handleCopy}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded font-bold text-xs transition-all"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        {/* QR code placeholder */}
        <div className="mb-6 flex flex-col items-center">
          <span className="text-orange-300 font-semibold text-sm mb-2">Scan QR to Donate</span>
          {/* Replace with a real QR code generator if desired */}
          <div className="bg-white p-2 rounded shadow">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${WALLET_ADDRESS}`} alt="Donation QR Code" className="w-36 h-36" />
          </div>
        </div>
        <div className="w-full mb-4">
          <h2 className="text-lg font-bold text-orange-400 mb-2">Supported Tokens</h2>
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {TOKENS.map(token => (
              <div key={token.symbol} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 bg-black/30 squared-full flex items-center justify-center border border-orange-900/20">
                  <img src={token.icon} alt={token.name} className="w-7 h-7 object-contain" />
                </div>
                <span className="text-xs text-orange-200 font-semibold">{token.symbol}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center mt-4">
          Thank you for supporting Sign Gamers! Every donation makes a difference. <br /> For questions, reach out on Discord or Twitter.
        </div>
      </div>
    </main>
  );
} 