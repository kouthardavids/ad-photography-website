import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS_LEFT = [
    { label: "Home", to: "/", id: "home" },
    { label: "About", to: "/about", id: "about" },
    { label: "Services", to: "/services", id: "services" },
];

const NAV_LINKS_RIGHT = [
    { label: "Portfolio", to: "/portfolio", id: "portfolio" },
    { label: "Testimonials", to: "/testimonials", id: "testimonials" },
    { label: "Contact", to: "/contact", id: "contact" },
];

const ALL_LINKS = [...NAV_LINKS_LEFT, ...NAV_LINKS_RIGHT];

const NAV_HEIGHT = 88;

export default function Nav() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [activeId, setActiveId] = useState("home");

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const sections = Array.from(
            document.querySelectorAll<HTMLElement>("[data-nav-theme]")
        );

        if (sections.length === 0) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const sectionTheme =
                            entry.target.getAttribute("data-nav-theme");

                        if (
                            sectionTheme === "light" ||
                            sectionTheme === "dark"
                        ) {
                            setTheme(sectionTheme);
                        }

                        if (entry.target.id) {
                            setActiveId(entry.target.id);
                        }
                    }
                });
            },
            {
                rootMargin: `-${NAV_HEIGHT}px 0px -${typeof window !== "undefined"
                    ? window.innerHeight - NAV_HEIGHT - 1
                    : 0
                    }px 0px`,
                threshold: 0,
            }
        );

        sections.forEach((section) =>
            observerRef.current!.observe(section)
        );

        return () => observerRef.current?.disconnect();
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
            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            window.history.pushState({}, "", path);
            setActiveId(id);
        }

        setOpen(false);
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-colors duration-150 ease-out sm:px-10 sm:py-8 ${isLight
                ? "bg-white text-neutral-900"
                : "bg-transparent text-white"
                }`}
        >
            <nav className="hidden gap-12 text-[15px] font-medium uppercase tracking-[0.2em] sm:flex">
                {NAV_LINKS_LEFT.map((link) => (
                    <a
                        key={link.id}
                        href={link.to}
                        onClick={(e) =>
                            handleNavClick(e, link.id, link.to)
                        }
                        className={`cursor-pointer opacity-90 transition hover:opacity-100 ${activeId === link.id ? "opacity-100" : ""
                            }`}
                    >
                        {link.label}
                    </a>
                ))}
            </nav>

            <nav className="hidden items-center gap-12 text-[15px] font-medium uppercase tracking-[0.2em] sm:flex">
                {NAV_LINKS_RIGHT.map((link) => (
                    <a
                        key={link.id}
                        href={link.to}
                        onClick={(e) =>
                            handleNavClick(e, link.id, link.to)
                        }
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
                onClick={() => setOpen((o) => !o)}
            >
                {open ? (
                    <X
                        size={22}
                        color={isLight ? "#171717" : "white"}
                    />
                ) : (
                    <Menu
                        size={22}
                        color={isLight ? "#171717" : "white"}
                    />
                )}
            </button>

            {open && (
                <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-neutral-200 bg-neutral-950/95 px-6 py-4 text-sm uppercase tracking-[0.15em] text-white backdrop-blur sm:hidden">
                    {ALL_LINKS.map((link) => (
                        <a
                            key={link.id}
                            href={link.to}
                            onClick={(e) =>
                                handleNavClick(e, link.id, link.to)
                            }
                            className="cursor-pointer py-2.5"
                        >
                            {link.label}
                        </a>
                    ))}

                    <a
                        href="/booking"
                        onClick={() => setOpen(false)}
                        className="mt-2 border border-white/70 px-4 py-3 text-center"
                    >
                        Book a Session
                    </a>
                </nav>
            )}
        </header>
    );
}