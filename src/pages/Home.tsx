import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";

const SLIDES = [
    {
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2400",
        alt: "Bride laughing in golden light, veil caught mid-air",
    },
    {
        src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2400",
        alt: "Couple walking hand in hand at sunset",
    },
    {
        src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=2400",
        alt: "Close portrait, soft window light",
    },
    {
        src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2400",
        alt: "Wedding party candid moment, natural light",
    },
];

const SLIDE_DURATION = 5400;

export default function Home() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const goTo = useCallback((next: number) => {
        setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (paused) return;

        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % SLIDES.length);
        }, SLIDE_DURATION);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [paused]);

    return (
        <section
            className="relative h-screen w-full overflow-hidden bg-neutral-950"
            aria-roledescription="carousel"
            aria-label="AD Photography — featured work"
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                >
                    <motion.img
                        src={SLIDES[index].src}
                        alt={SLIDES[index].alt}
                        className="h-full w-full object-cover"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.08 }}
                        transition={{ duration: SLIDE_DURATION / 1000 + 1.4, ease: "linear" }}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />

            <Nav />

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
                <motion.h1
                    key={`title-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="text-5xl font-light tracking-wide sm:text-7xl"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    AD Photography
                </motion.h1>
                <motion.p
                    key={`sub-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                    className="mt-4 text-xs font-medium uppercase tracking-[0.35em] text-white/85 sm:text-sm"
                >
                    Wedding &amp; Portrait Photography — Cape Town
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                >
                    <Link
                        to="/booking"
                        className="mt-10 inline-block border border-white/70 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.25em] transition hover:bg-white hover:text-neutral-900"
                    >
                        Book a Session
                    </Link>
                </motion.div>
            </div>

            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className="h-1.5 rounded-full transition-all"
                        style={{
                            width: i === index ? 24 : 6,
                            backgroundColor: i === index ? "white" : "rgba(255,255,255,0.4)",
                        }}
                    />
                ))}
            </div>
        </section>
    );
}