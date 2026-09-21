import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { PACKAGES, FAQS } from "../lib/data";

function useInView<T extends HTMLElement>(threshold = 0.10) {
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

export default function Services() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div>
            <FadeUp>
                <section className="mx-auto max-w-3xl px-6 py-16 text-center">
                    <h1
                        className="text-3xl font-light tracking-wide sm:text-5xl"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        Services &amp; Pricing
                    </h1>
                    <p className="mt-3 text-sm text-neutral-500">
                        Three packages, no hidden extras. Custom quotes available for multi-day events.
                    </p>
                </section>
            </FadeUp>

            <section className="mx-auto max-w-6xl px-6 pb-20">
                <div className="grid gap-6 sm:grid-cols-3">
                    {PACKAGES.map((pkg, i) => (
                        <FadeUp key={pkg.id} delay={i * 150}>
                            <div
                                className={`relative flex h-full flex-col border p-8 ${pkg.highlighted
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-200 bg-white text-neutral-900"
                                    }`}
                            >
                                {pkg.highlighted && (
                                    <span className="absolute -top-3 left-8 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-900">
                                        Most Popular
                                    </span>
                                )}
                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-70">{pkg.name}</p>
                                <p className="mt-3 text-3xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {pkg.price}
                                </p>
                                <p className={`mt-3 text-sm ${pkg.highlighted ? "text-neutral-300" : "text-neutral-500"}`}>
                                    {pkg.description}
                                </p>

                                <ul className="mt-6 flex-1 space-y-3">
                                    {pkg.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm">
                                            <Check size={16} className="mt-0.5 shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to={`/booking?package=${pkg.id}`}
                                    className={`mt-8 block border px-6 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] transition ${pkg.highlighted
                                        ? "border-white hover:bg-white hover:text-neutral-900"
                                        : "border-neutral-900 hover:bg-neutral-900 hover:text-white"
                                        }`}
                                >
                                    Book This Package
                                </Link>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </section>

            <section className="bg-[#F3EEE6] px-6 py-16">
                <div className="mx-auto max-w-2xl">
                    <FadeUp>
                        <h2 className="text-center text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Frequently asked
                        </h2>
                    </FadeUp>
                    <div className="mt-8 divide-y divide-neutral-300">
                        {FAQS.map((f, i) => (
                            <FadeUp key={f.q} delay={i * 100}>
                                <div>
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="flex w-full items-center justify-between py-4 text-left"
                                    >
                                        <span className="text-sm font-medium text-neutral-900">{f.q}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {openFaq === i && <p className="pb-4 text-sm text-neutral-600">{f.a}</p>}
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}