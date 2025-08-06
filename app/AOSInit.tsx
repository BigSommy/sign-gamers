"use client";
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);
  return null;
}
