import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BRAND } from "../lib/data";

const LINKS = [
    { label: "Portfolio", to: "/portfolio" },
    { label: "Services & Pricing", to: "/services" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
];

export default function Nav() {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#FBF9F5]/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                <Link
                    to="/"
                    className="text-lg tracking-[0.15em] text-neutral-900"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    {BRAND.name.toUpperCase()}
                </Link>

                <nav className="hidden gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-700 sm:flex">
                    {LINKS.map((link) => (
                        <Link
                            to={link.to}
                            className={`transition hover:text-neutral-950 ${pathname === link.to ? "text-neutral-950" : ""
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <Link
                    to="/booking"
                    className="hidden border border-neutral-900 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white sm:inline-block"
                >
                    Book a Session
                </Link>

                <button
                    className="sm:hidden"
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <nav className="flex flex-col gap-1 border-t border-neutral-200 bg-[#FBF9F5] px-6 py-4 text-sm uppercase tracking-[0.15em] sm:hidden">
                    {LINKS.map((link) => (
                        <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-2.5">
                            {link.label}
                        </Link>
                    ))}
                    <Link to="/booking" onClick={() => setOpen(false)} className="mt-2 border border-neutral-900 px-4 py-3 text-center">
                        Book a Session
                    </Link>
                </nav>
            )}
        </header>
    );
}