"use client";
import React, { useState, useEffect } from 'react';
import Header from './Header';
import NavPanel from './NavPanel';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <>
      <Header navOpen={navOpen} setNavOpen={setNavOpen} />
      <NavPanel navOpen={navOpen} setNavOpen={setNavOpen} />
      <div className="pt-2 md:pt-2">
        <AuthGuard>{children}</AuthGuard>
      </div>
    </>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait until auth state is resolved
    if (loading) return;

    // Public paths: homepage and anything under /auth (sign in / sign up / verify)
    const isPublic = pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico';
    if (isPublic) return;

    if (!user) {
      // Redirect unauthenticated users to sign-in
      router.push('/auth/signin');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>
    );
  }

  return <>{children}</>;
}
