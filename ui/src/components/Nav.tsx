import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLenis } from "lenis/react";

const NAV_LINKS_LEFT = [
    { label: "Home", to: "/", id: "home" },
    { label: "About", to: "/about", id: "about" },
    { label: "Services", to: "/services", id: "services" },
];

const NAV_LINKS_RIGHT = [
    { label: "Portfolio", to: "/portfolio", id: "portfolio" },
    { label: "Testimonials", to: "/testimonials", id: "testimonials" },
    { label: "Contact", to: "/about", id: "about" },
];

const ALL_LINKS = [...NAV_LINKS_LEFT, ...NAV_LINKS_RIGHT];

const NAV_HEIGHT = 88;

export default function Nav() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [activeId, setActiveId] = useState("home");

    const lenis = useLenis();

    useEffect(() => {
        const sections = Array.from(
            document.querySelectorAll<HTMLElement>("[data-nav-theme]")
        );

        if (sections.length === 0) return;

        const home = sections.find((section) => section.id === "home");
        const crossing = new Set<HTMLElement>();

        const apply = () => {
            const current =
                sections
                    .filter((section) => crossing.has(section) && section !== home)
                    .pop() ?? home;

            if (!current) return;

            const sectionTheme = current.getAttribute("data-nav-theme");

            if (sectionTheme === "light" || sectionTheme === "dark") {
                setTheme(sectionTheme);
            }

            if (current.id) {
                setActiveId(current.id);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const section = entry.target as HTMLElement;

                    if (entry.isIntersecting) {
                        crossing.add(section);
                    } else {
                        crossing.delete(section);
                    }
                });

                apply();
            },
            {
                rootMargin: `-${NAV_HEIGHT}px 0px -${typeof window !== "undefined"
                    ? window.innerHeight - NAV_HEIGHT - 1
                    : 0
                    }px 0px`,
                threshold: 0,
            }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const isLight = theme === "light";

    const handleNavClick = (
        event: React.MouseEvent<HTMLAnchorElement>,
        id: string,
        path: string
    ) => {
        event.preventDefault();

        const section = document.getElementById(id);

        if (section) {
            const immediate = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (lenis) {
                lenis.scrollTo(id === "home" ? 0 : section, { duration: 1.4, immediate });
            } else if (id === "home") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }

            window.history.pushState({}, "", path);
            setActiveId(id);
        }

        setOpen(false);
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            {/* Background layers: both span the full header height, which grows with the menu */}
            <div
                aria-hidden="true"
                className={`absolute inset-0 transition-colors duration-300 ease-out motion-reduce:transition-none ${isLight ? "bg-white" : "bg-transparent"
                    }`}
            />
            <div
                aria-hidden="true"
                className={`absolute inset-0 bg-neutral-950/95 backdrop-blur transition-opacity duration-300 ease-out motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* Top bar */}
            <div
                className={`relative flex items-center justify-between px-6 py-6 transition-colors duration-300 ease-out motion-reduce:transition-none sm:px-10 sm:py-8 ${open || !isLight ? "text-white" : "text-neutral-900"
                    }`}
            >
                <nav className="hidden gap-8 text-[18px] font-medium uppercase tracking-[0.2em] sm:flex lg:gap-12">
                    {NAV_LINKS_LEFT.map((link) => (
                        <a
                            key={link.id}
                            href={link.to}
                            onClick={(e) => handleNavClick(e, link.id, link.to)}
                            className={`cursor-pointer opacity-90 transition hover:opacity-100 ${activeId === link.id ? "opacity-100" : ""
                                }`}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <nav className="hidden items-center gap-8 text-[20px] font-medium uppercase tracking-[0.2em] sm:flex lg:gap-12">
                    {NAV_LINKS_RIGHT.map((link) => (
                        <a
                            key={link.id}
                            href={link.to}
                            onClick={(e) => handleNavClick(e, link.id, link.to)}
                            className={`cursor-pointer opacity-90 transition hover:opacity-100 ${activeId === link.id ? "opacity-100" : ""
                                }`}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <button
                    className="sm:hidden"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? (
                        <X size={22} color="white" />
                    ) : (
                        <Menu size={22} color={isLight ? "#171717" : "white"} />
                    )}
                </button>
            </div>

            {/* Mobile menu: sits in the header's flow, so the background grows with it */}
            <div
                aria-hidden={!open}
                className={`relative grid text-white transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none sm:hidden ${open
                    ? "grid-rows-[1fr]"
                    : "pointer-events-none grid-rows-[0fr]"
                    }`}
            >
                <nav className="min-h-0 overflow-hidden px-6 text-sm uppercase tracking-[0.15em]">
                    <div className="flex flex-col gap-1 pb-6 pt-2">
                        {ALL_LINKS.map((link) => (
                            <a
                                key={link.id}
                                href={link.to}
                                tabIndex={open ? 0 : -1}
                                onClick={(e) => handleNavClick(e, link.id, link.to)}
                                className="cursor-pointer py-2.5"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </nav>
            </div>
        </header>
    );
}