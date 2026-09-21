import { Mail, Phone } from "lucide-react";
import { BRAND } from "../lib/data";

export default function Footer() {
    return (
        <footer className="bg-neutral-950 text-white">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
                <div>
                    <p className="text-lg tracking-[0.15em]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        {BRAND.name.toUpperCase()}
                    </p>
                    <p className="mt-3 text-sm text-neutral-400">{BRAND.tagline}</p>
                </div>

                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">Get in touch</p>
                    <a href={`mailto:${BRAND.email}`} className="mt-3 flex items-center gap-2 text-sm hover:text-neutral-300">
                        <Mail size={14} /> {BRAND.email}
                    </a>
                    <a href={`tel:${BRAND.phone}`} className="mt-2 flex items-center gap-2 text-sm hover:text-neutral-300">
                        <Phone size={14} /> {BRAND.phone}
                    </a>
                    <a
                        href={BRAND.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex items-center gap-2 text-sm hover:text-neutral-300"
                    >
                        Instagram
                    </a>
                </div>
            </div>

            <div className="border-t border-neutral-800 px-6 py-6 text-center text-xs text-neutral-500">
                © {new Date().getFullYear()} {BRAND.name}. Based in {BRAND.areaServed}.
            </div>
        </footer>
    );
}