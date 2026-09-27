import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
    {
        quote: "We didn't get photos of our wedding, we got photos of how it actually felt.",
        name: "Megan & Tiaan",
        detail: "Married in Franschhoek, Nov 2025",
    },
    {
        quote: "First time I ever forgot a camera was in the room. The gallery still makes me tear up.",
        name: "Zainab R.",
        detail: "Engagement session, Sea Point",
    },
    {
        quote: "Our timeline changed three times that day and AD just kept up, calm the whole way through.",
        name: "Kyle & Reece",
        detail: "Married in Stellenbosch, Feb 2026",
    },
    {
        quote: "My mother, who hates every photo of herself, asked for a print of one of these.",
        name: "Nadia P.",
        detail: "Family portrait session, Kalk Bay",
    },
    {
        quote: "Booked with low expectations after a bad first photographer. Completely different level.",
        name: "Werner & Lise",
        detail: "Married in Paarl, Sep 2025",
    },
    {
        quote: "We asked for documentary, not staged, and that's exactly what came back to us.",
        name: "Amy & Josh",
        detail: "Married in Hermanus, Apr 2026",
    },
];

function useInView<T extends HTMLElement>(threshold = 0.1) {
    const ref = useRef<T | null>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: "0px 0px -100px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

function FadeUp({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                willChange: "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}

export default function Testimonials() {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const goTo = useCallback((next: number, dir: number) => {
        setDirection(dir);
        setIndex(((next % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setIndex((i) => (i + 1) % TESTIMONIALS.length);
        }, 6500);
        return () => clearInterval(timer);
    }, []);

    const current = TESTIMONIALS[index];

    return (
        <div data-nav-theme="light" id="testimonials">

            <FadeUp>
                <section className="bg-[#F3EEE6] px-6 py-16 text-center">
                    <FadeUp>
                        <section className="mx-auto max-w-3xl px-6 pt-16 text-center">
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                                Kind words
                            </p>
                            <h1
                                className="mt-3 text-3xl font-light tracking-wide sm:text-5xl"
                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            >
                                From behind the lens, in their words
                            </h1>
                        </section>
                    </FadeUp>

                    <section className="bg-[#F3EEE6] px-6 py-12">
                        <div className="mx-auto max-w-3xl">
                            <div className="relative flex items-center gap-4 sm:gap-8">
                                <button
                                    onClick={() => goTo(index - 1, -1)}
                                    aria-label="Previous testimonial"
                                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900 sm:flex"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="relative min-h-[160px] flex-1 text-center">
                                    <AnimatePresence mode="wait" custom={direction}>
                                        <motion.div
                                            key={index}
                                            custom={direction}
                                            initial={{ opacity: 0, x: 24 * direction }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -24 * direction }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <p className="text-lg leading-relaxed text-neutral-800 sm:text-xl">
                                                "{current.quote}"
                                            </p>
                                            <p className="mt-6 text-sm font-medium text-neutral-900">
                                                {current.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-500">{current.detail}</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <button
                                    onClick={() => goTo(index + 1, 1)}
                                    aria-label="Next testimonial"
                                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900 sm:flex"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 sm:hidden">
                                <button
                                    onClick={() => goTo(index - 1, -1)}
                                    aria-label="Previous testimonial"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-500"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => goTo(index + 1, 1)}
                                    aria-label="Next testimonial"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-500"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="mt-8 flex justify-center gap-2">
                                {TESTIMONIALS.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goTo(i, i > index ? 1 : -1)}
                                        aria-label={`Go to testimonial ${i + 1}`}
                                        className="h-1.5 rounded-full transition-all"
                                        style={{
                                            width: i === index ? 24 : 6,
                                            backgroundColor: i === index ? "#171717" : "#D8CFC0",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </section>
            </FadeUp>
        </div >
    );
}