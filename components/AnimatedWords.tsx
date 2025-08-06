"use client";
import React, { useState, useEffect } from "react";

interface AnimatedWordsProps {
  words: string[];
  className?: string;
  delay?: number; // Time each word stays before switching (ms)
}

export default function AnimatedWords({
  words,
  className = "",
  delay = 2000,
}: AnimatedWordsProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 300); // fade-out duration
    }, delay);

    return () => clearTimeout(timeout);
  }, [index, delay, words.length]);

  return (
    <span
      className={`transition-opacity duration-300 ${
        fade ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {words[index]}
    </span>
  );
}
