import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND } from "../lib/data";

const NAV_LINKS_LEFT = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Services", to: "/services" },
];
const NAV_LINKS_RIGHT = [
    { label: "Portfolio", to: "/portfolio" },
    { label: "Testimonals", to: "/testimonals" },
    { label: "Contact", to: "/contact" },
];
const ALL_LINKS = [...NAV_LINKS_LEFT, ...NAV_LINKS_RIGHT];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 text-white transition-colors duration-300 sm:px-10 sm:py-8 ${scrolled ? "bg-neutral-950/95 backdrop-blur" : "bg-transparent"
                }`}
        >
            <nav className="hidden gap-12 text-[15px] font-medium uppercase tracking-[0.2em] sm:flex">
                {NAV_LINKS_LEFT.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`opacity-90 transition hover:opacity-100 ${pathname === link.to ? "opacity-100" : ""
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <Link
                to="/"
                className="text-lg tracking-[0.15em] text-white sm:hidden"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
                {BRAND.name.toUpperCase()}
            </Link>

            <nav className="hidden items-center gap-12 text-[15px] font-medium uppercase tracking-[0.2em] sm:flex">
                {NAV_LINKS_RIGHT.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`opacity-90 transition hover:opacity-100 ${pathname === link.to ? "opacity-100" : ""
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <button
                className="sm:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
            >
                {open ? <X size={22} color="white" /> : <Menu size={22} color="white" />}
            </button>

            {open && (
                <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-white/20 bg-neutral-950/95 px-6 py-4 text-sm uppercase tracking-[0.15em] text-white backdrop-blur sm:hidden">
                    {ALL_LINKS.map((link) => (
                        <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-2.5">
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        to="/booking"
                        onClick={() => setOpen(false)}
                        className="mt-2 border border-white/70 px-4 py-3 text-center"
                    >
                        Book a Session
                    </Link>
                </nav>
            )}
        </header>
    );
}