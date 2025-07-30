"use client";
import React, { useState } from 'react';
import Header from './Header';
import NavPanel from './NavPanel';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <>
      <Header navOpen={navOpen} setNavOpen={setNavOpen} />
      <NavPanel navOpen={navOpen} setNavOpen={setNavOpen} />
      <div className="pt-20 md:pt-24">{children}</div>
    </>
  );
}
