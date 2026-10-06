import { Link } from "react-router-dom";
import logo from "../../public/logo.jpeg"

const BTS_IMAGES = [
    "https://images.unsplash.com/photo-1614108831136-a6bba175a08e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1624913503273-5f9c4e980dba?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    logo,
];

export default function About() {
    return (
        <div data-nav-theme="light" id="about">
            <section className="mx-auto max-w-2xl px-6 py-16 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500">About</p>
                <h1 className="mt-3 text-4xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Hi, I'm Aneesa. Lovely to meet you.
                </h1>
                <p className="mt-5 text-base leading-relaxed text-neutral-700">
                    I love photography, and I still get excited when I see a good
                    moment coming. <strong>Ten years and hundreds of weddings in</strong>,
                    my favourite spot is the edge of the room, watching a dad wipe his
                    eyes or a bridesmaid crack up in the middle of a speech. I'm based
                    in Cape Town, South Africa.
                </p>
                <p className="mt-4 text-base leading-relaxed text-neutral-700">
                    I'd love to hear about your day.
                </p>

                <Link
                    to="/booking"
                    className="mt-8 inline-block border border-neutral-900 px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                    Get in Touch
                </Link>
            </section>

            <section className="mx-auto max-w-5xl px-6 pb-20">
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