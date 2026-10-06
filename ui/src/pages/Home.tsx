import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Slide {
    src: string;
    alt: string;
    position?: string;
    mobilePosition?: string;
    mobileSrc?: string;
    hideOnMobile?: boolean;
    mobileOnly?: boolean;
    offsetX?: string;
}

const SLIDES: Slide[] = [
    {
        src: "./images/DSC_0818.jpg",
        alt: "Close portrait, soft window light",
        mobilePosition: "60% center",
        mobileOnly: true,
    },
    {
        src: "./images/landscape/landscape4.jpg",
        alt: "Close portrait, soft window light",
        position: "center 5%",
        mobilePosition: "40% center",
        offsetX: "0.5%",
    },
    {
        src: "./images/DSC_0395.webp",
        alt: "Bride laughing in golden light, veil caught mid-air",
        position: "center center",
        mobilePosition: "70% center",
        mobileOnly: true,
    },
    {
        src: "./images/landscape/landscape3.jpg",
        alt: "Wedding party candid moment, natural light",
        mobilePosition: "50% center",
        hideOnMobile: true,
        position: "center 37%",
        offsetX: "-7.2%",
    },
    {
        src: "./images/landscape/landscape.jpg",
        alt: "Bride laughing in golden light, veil caught mid-air",
        position: "center center",
        mobilePosition: "50% center",
        hideOnMobile: true,
    },
    {
        src: "./images/DSC_0630.webp",
        alt: "Bride laughing in golden light, veil caught mid-air",
        position: "center center",
        mobilePosition: "50% center",
        mobileOnly: true,
    },
    {
        src: "/images/landscape/landscape2.jpg",
        alt: "Couple walking hand in hand at sunset",
        position: "center 20%",
        mobilePosition: "60% center",
        offsetX: "-12%",
    },
];

const SLIDE_DURATION = 4500;

function useIsMobile(breakpoint = 639) {
    const query = `(max-width: ${breakpoint}px)`;
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return isMobile;
}

export default function Home() {
    const [index, setIndex] = useState(0);
    const [paused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [ready, setReady] = useState(false);

    const isMobile = useIsMobile();
    const slides = useMemo(
        () =>
            SLIDES.filter((s) => {
                if (isMobile) return !s.hideOnMobile;
                return !s.mobileOnly;
            }),
        [isMobile]
    );

    useEffect(() => {
        setIndex(0);
    }, [slides]);

    const goTo = useCallback(
        (next: number) => {
            setIndex(((next % slides.length) + slides.length) % slides.length);
        },
        [slides]
    );

    useEffect(() => {
        let cancelled = false;

        const first = new Image();
        first.src = slides[0].src;
        first.decode().catch(() => { }).then(() => {
            if (!cancelled) setReady(true);
        });

        slides.slice(1).forEach((s) => {
            const img = new Image();
            img.src = s.src;
            img.decode().catch(() => { });
        });

        return () => { cancelled = true; };
    }, [slides]);

    useEffect(() => {
        if (paused || !ready) return;

        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, SLIDE_DURATION);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [paused, ready, slides]);

    return (
        <section
            id="home"
            data-nav-theme="dark"
            className="relative h-screen w-full overflow-hidden bg-neutral-950"
            aria-roledescription="carousel"
            aria-label="AD Photography — featured work"
        >
            {ready && (
                <AnimatePresence>
                    <motion.div
                        key={index}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, ease: "easeInOut" }}
                    >
                        <picture className="block h-full w-full overflow-hidden">
                            {slides[index].mobileSrc && (
                                <source media="(max-width: 639px)" srcSet={slides[index].mobileSrc} />
                            )}
                            <motion.img
                                src={slides[index].src}
                                alt={slides[index].alt}
                                className="h-full w-full object-cover [object-position:var(--mpos,center)] sm:relative sm:w-[115%] sm:max-w-none sm:left-[var(--x,-7.5%)] sm:[object-position:var(--pos,center)]"
                                style={{
                                    willChange: "transform",
                                    ["--pos" as string]: slides[index].position ?? "center",
                                    ["--mpos" as string]: slides[index].mobilePosition ?? "center",
                                    ["--x" as string]: slides[index].offsetX ?? "-7.5%",
                                }}
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.08 }}
                                transition={{ duration: SLIDE_DURATION / 1000 + 1.4, ease: "linear" }}
                            />
                        </picture>
                    </motion.div>
                </AnimatePresence>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />

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
                {slides.map((_, i) => (
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