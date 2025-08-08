import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Tournament type matches the one in tournaments/page.tsx
export type Tournament = {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "ongoing" | "past";
  banner_url: string | null;
  register_link: string | null;
  registration_deadline?: string;
  end_date?: string;
};

interface FeaturedTournamentCarouselProps {
  tournaments: Tournament[];
}


const CARD_WIDTH = 340; // px
const CARD_GAP = 20; // px
const AUTO_SCROLL_INTERVAL = 5000; // ms

export default function FeaturedTournamentCarousel({ tournaments }: FeaturedTournamentCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive cards per view
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (tournaments.length <= cardsPerView) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tournaments.length);
    }, AUTO_SCROLL_INTERVAL);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tournaments.length, cardsPerView]);

  // Snap to card on current change
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = CARD_WIDTH + CARD_GAP;
    container.scrollTo({
      left: current * cardWidth,
      behavior: "smooth",
    });
  }, [current]);

  // Manual navigation
  const goTo = (idx: number) => {
    setCurrent(idx);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Truncate description
  const truncate = (str: string, n: number) =>
    str.length > n ? str.slice(0, n - 1) + "..." : str;

  // Only show the visible cards for the current view
  const getVisibleTournaments = () => {
    if (cardsPerView === 1) {
      return tournaments.slice(current, current + 1);
    } else if (cardsPerView === 2) {
      if (current === tournaments.length - 1) {
        return [tournaments[current], tournaments[0]];
      }
      return tournaments.slice(current, current + 2);
    } else {
      // 3 or more
      if (current === tournaments.length - 2) {
        return [tournaments[current], tournaments[current + 1], tournaments[0]];
      } else if (current === tournaments.length - 1) {
        return [tournaments[current], tournaments[0], tournaments[1]];
      }
      return tournaments.slice(current, current + 3);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 mb-12">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400 font-['Exo_2'] drop-shadow">Featured Tournaments</h2>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-full bg-[#18181b] border border-gray-700 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors duration-150 shadow"
            onClick={() => goTo((current - 1 + tournaments.length) % tournaments.length)}
            aria-label="Previous Tournament"
            disabled={tournaments.length <= 1}
          >
            <FaChevronLeft />
          </button>
          <button
            className="p-2 rounded-full bg-[#18181b] border border-gray-700 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors duration-150 shadow"
            onClick={() => goTo((current + 1) % tournaments.length)}
            aria-label="Next Tournament"
            disabled={tournaments.length <= 1}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-5 pb-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {getVisibleTournaments().map((t, idx) => (
          <div
            key={t.id}
            className={`min-w-[${CARD_WIDTH}px] max-w-[${CARD_WIDTH}px] snap-center bg-[#23232a]/80 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-500/30 flex flex-col transition-transform duration-300 ${idx === 0 ? "scale-100" : "scale-95 opacity-80"}`}
            style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
          >
            {t.banner_url && (
              <img
                src={t.banner_url}
                alt={t.title}
                className="w-full h-40 object-cover rounded-t-2xl"
                loading="lazy"
              />
            )}
            <div className="flex-1 flex flex-col p-4">
              <h3 className="text-lg font-bold text-orange-400 mb-1 font-['Exo_2'] truncate">{t.title}</h3>
              <p className="text-gray-200 text-sm mb-3 line-clamp-3">{truncate(t.description, 110)}</p>
              <Link
                href={`/tournaments/${t.id}`}
                className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all duration-200 text-center"
              >
                Join Now
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-2">
        {tournaments.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 border-orange-400 transition-all duration-200 ${idx === current ? "bg-orange-400" : "bg-transparent"}`}
            onClick={() => goTo(idx)}
            aria-label={`Go to tournament ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
