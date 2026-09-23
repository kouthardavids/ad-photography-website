import { Link } from "react-router-dom";

const BTS_IMAGES = [
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800",
    "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=800",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800",
];

export default function About() {
    return (
        <div data-nav-theme="light" id="about">
            <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 sm:grid-cols-2 sm:items-center">
                <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                    <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200"
                        alt="AD, photographer, on location"
                        className="h-full w-full object-cover"
                    />
                </div>

                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">About</p>
                    <h1 className="mt-3 text-4xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Hi, I'm AD.
                    </h1>
                    <p className="mt-5 text-sm leading-relaxed text-neutral-700">
                        I started shooting weddings for friends because I couldn't stand
                        posed, stiff photography. <strong>Ten years and hundreds of
                            weddings later</strong>, my approach hasn't changed: stay out of
                        the way, catch what's real, and let the day tell its own story.
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                        I'm based in Cape Town but travel across the Western Cape (and
                        beyond) for the right story. <strong>Golden hour, quiet
                            moments, and bad dance-floor lighting</strong> are all fair
                        game — I shoot what's happening, not what's staged.
                    </p>

                    <Link
                        to="/booking"
                        className="mt-8 inline-block border border-neutral-900 px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                    >
                        Book a Session
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 pb-20">
                <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                    Behind the scenes
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                    {BTS_IMAGES.map((src) => (
                        <div key={src} className="aspect-square overflow-hidden bg-neutral-100">
                            <img src={src} alt="Behind the scenes" className="h-full w-full object-cover" />
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}