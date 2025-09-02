
"use client";
import { AiFillHome } from 'react-icons/ai';
import { FaGamepad, FaUser, FaUsers } from 'react-icons/fa';
import './globals.css';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Inter } from 'next/font/google';
import BackgroundFX from '@/components/BackgroundFX';
import ClientLayout from './ClientLayout';
import AOSInit from './AOSInit';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// Sticky Bottom Mobile Nav for all pages
function MobileBottomNav() {
  const pathname = usePathname() || '/'
  const { user } = useAuth()

  const makeClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center ${isActive ? 'text-white drop-shadow-[0_0_8px_#fff]' : 'text-orange-400'} text-xs font-semibold px-2 transition-all duration-200 hover:text-white hover:drop-shadow-[0_0_8px_#f23900]`

  const homeActive = pathname === '/'
  const tournamentsActive = pathname.startsWith('/tournaments')
  const communityActive = pathname.startsWith('/community')
  const profileHref = user ? `/profile/${user.id}` : '/auth/signin'
  const profileActive = pathname.startsWith('/profile')

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#18181b] border-t border-orange-900/40 flex sm:hidden justify-around items-center py-2 shadow-2xl" style={{boxShadow:'0 -2px 16px #0008'}}>
      <a href="/" className={makeClass(homeActive)}>
        <AiFillHome size={24} />
        <span className="text-[10px] mt-1">Home</span>
      </a>
      <a href="/tournaments" className={makeClass(tournamentsActive)}>
        <FaGamepad size={22} />
        <span className="text-[10px] mt-1">Tournaments</span>
      </a>
      <a href="/community" className={makeClass(communityActive)}>
        <FaUsers size={22} />
        <span className="text-[10px] mt-1">Community</span>
      </a>
      <a href={profileHref} className={makeClass(profileActive)}>
        <FaUser size={22} />
        <span className="text-[10px] mt-1">Profile</span>
      </a>
    </nav>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <BackgroundFX />
          <AOSInit />
          <ClientLayout>{children}</ClientLayout>
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
