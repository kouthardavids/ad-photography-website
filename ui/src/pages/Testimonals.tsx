import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "../lib/data";

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

function TestimonialContent({
    quote,
    name,
    detail,
}: {
    quote: string;
    name: string;
    detail: string;
}) {
    return (
        <>
            <p className="text-[16px] leading-relaxed text-neutral-800 sm:text-xl">
                "{quote}"
            </p>
            <p className="mt-4 text-[14px] font-medium text-neutral-900 sm:mt-6 sm:text-sm">
                {name}
            </p>
            <p className="mt-0.5 text-[10px] text-neutral-500 sm:text-xs">{detail}</p>
        </>
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
                <section className="bg-[#F3EEE6] px-6 py-10 text-center sm:py-16">
                    <FadeUp>
                        <section className="mx-auto max-w-3xl px-6 pt-4 text-center sm:pt-16">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500 sm:text-[11px]">
                                Kind words
                            </p>
                            <h1
                                className="mt-3 text-[26px] font-light tracking-wide sm:text-5xl"
                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            >
                                From behind the lens
                            </h1>
                        </section>
                    </FadeUp>

                    <section className="bg-[#F3EEE6] px-6 py-6 sm:py-12">
                        <div className="mx-auto max-w-3xl">
                            <div className="relative flex items-center gap-4 sm:gap-8">
                                <button
                                    onClick={() => goTo(index - 1, -1)}
                                    aria-label="Previous testimonial"
                                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900 sm:flex"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="grid flex-1 text-center">
                                    {TESTIMONIALS.map((t, i) => (
                                        <div
                                            key={i}
                                            aria-hidden="true"
                                            className="invisible col-start-1 row-start-1 select-none"
                                        >
                                            <TestimonialContent
                                                quote={t.quote}
                                                name={t.name}
                                                detail={t.detail}
                                            />
                                        </div>
                                    ))}

                                    <AnimatePresence mode="wait" custom={direction}>
                                        <motion.div
                                            key={index}
                                            custom={direction}
                                            className="col-start-1 row-start-1"
                                            initial={{ opacity: 0, x: 24 * direction }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -24 * direction }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <TestimonialContent
                                                quote={current.quote}
                                                name={current.name}
                                                detail={current.detail}
                                            />
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

                            <div className="mt-3 flex items-center justify-center gap-2 sm:hidden">
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

                            <div className="mt-4 flex justify-center gap-2 sm:mt-8">
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
        </div>
    );
}