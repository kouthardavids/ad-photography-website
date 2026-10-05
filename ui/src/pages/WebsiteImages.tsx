import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Replace, Trash2 } from "lucide-react";
import { PORTFOLIO_IMAGES } from "../lib/data";

interface SiteImage {
    id: string;
    src: string;
    alt: string;
    position?: string;
}

type Tab = "portfolio" | "hero";

const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

const INITIAL_HERO: SiteImage[] = [
    { id: "h1", src: "/images/landscape/landscape4.jpg", alt: "Close portrait, soft window light", position: "center 10%" },
    { id: "h2", src: "/images/landscape/landscape3.jpg", alt: "Wedding party candid moment" },
    { id: "h3", src: "/images/landscape/landscape2.jpg", alt: "Couple walking at sunset", position: "center 12%" },
    { id: "h4", src: "/images/landscape/landscape.jpg", alt: "Bride laughing in golden light" },
];

export default function WebsiteImages() {
    const [portfolio, setPortfolio] = useState<SiteImage[]>(PORTFOLIO_IMAGES);
    const [hero, setHero] = useState<SiteImage[]>(INITIAL_HERO);
    const [tab, setTab] = useState<Tab>("portfolio");
    const [heroIndex, setHeroIndex] = useState(0);
    const [dirty, setDirty] = useState(false);
    const [published, setPublished] = useState(false);
    const urlsRef = useRef<string[]>([]);

    useEffect(() => {
        const urls = urlsRef.current;
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, []);

    const images = tab === "portfolio" ? portfolio : hero;
    const setImages = (next: SiteImage[]) => {
        (tab === "portfolio" ? setPortfolio : setHero)(next);
        setDirty(true);
        setPublished(false);
    };

    const toUrl = (file: File) => {
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        return url;
    };

    const add = (files: FileList | null) => {
        if (!files) return;
        const added = Array.from(files)
            .filter((f) => f.type.startsWith("image/"))
            .map((f) => ({ id: crypto.randomUUID(), src: toUrl(f), alt: f.name.replace(/\.[^.]+$/, "") }));
        setImages([...images, ...added]);
    };

    const replaceAt = (i: number, files: FileList | null) => {
        const file = files?.[0];
        if (!file) return;
        setImages(images.map((img, idx) => (idx === i ? { ...img, src: toUrl(file), position: undefined } : img)));
    };

    const move = (i: number, d: -1 | 1) => {
        const j = i + d;
        if (j < 0 || j >= images.length) return;
        const next = [...images];
        [next[i], next[j]] = [next[j], next[i]];
        setImages(next);
    };

    const remove = (i: number) => setImages(images.filter((_, idx) => idx !== i));
    const editAlt = (i: number, alt: string) => setImages(images.map((img, idx) => (idx === i ? { ...img, alt } : img)));

    const publish = () => {
        // Replace with a real save: upload new files to storage, then store the ordered list in your database.
        setDirty(false);
        setPublished(true);
    };

    const heroShown = hero[Math.min(heroIndex, hero.length - 1)];

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-4xl font-light tracking-wide sm:text-6xl" style={serif}>
                        Website photos
                    </h1>
                    <p className="mt-3 max-w-xl text-neutral-600">
                        Change the photos on your site. The preview shows how each section will look to visitors.
                    </p>
                </div>
                <button
                    onClick={publish}
                    disabled={!dirty}
                    className={`px-6 py-3 text-[11px] font-medium uppercase tracking-[0.25em] transition ${dirty ? "bg-neutral-900 text-white hover:bg-neutral-700" : "bg-neutral-300 text-neutral-500"
                        }`}
                >
                    {published ? "Published" : "Publish changes"}
                </button>
            </div>

            <div className="mt-8 flex gap-2">
                {(["portfolio", "hero"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        aria-pressed={tab === t}
                        className={`rounded-full border px-4 py-1.5 text-sm transition ${tab === t
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
                            }`}
                    >
                        {t === "portfolio" ? "Portfolio" : "Homepage slideshow"}
                    </button>
                ))}
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
                {/* Manage */}
                <section aria-label="Manage photos">
                    {tab === "portfolio" && (
                        <p className="mb-4 text-sm text-neutral-600">
                            The middle photo in each row of three is shown tall. Put portrait photos in positions 2, 5 and 8.
                        </p>
                    )}
                    <ul className="flex flex-col gap-2">
                        {images.map((img, i) => (
                            <li
                                key={img.id}
                                onClick={() => tab === "hero" && setHeroIndex(i)}
                                className={`flex items-center gap-3 rounded-xl bg-white p-2.5 ${tab === "hero" && i === heroIndex ? "ring-1 ring-neutral-900" : ""
                                    }`}
                            >
                                <img src={img.src} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                                <input
                                    value={img.alt}
                                    onChange={(e) => editAlt(i, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="Photo description"
                                    className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1.5 text-sm outline-none hover:border-neutral-300 focus:border-neutral-900"
                                />
                                <div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => move(i, -1)} aria-label="Move up" className="p-1.5 text-neutral-500 hover:text-neutral-900">
                                        <ArrowUp size={15} />
                                    </button>
                                    <button onClick={() => move(i, 1)} aria-label="Move down" className="p-1.5 text-neutral-500 hover:text-neutral-900">
                                        <ArrowDown size={15} />
                                    </button>
                                    <label className="cursor-pointer p-1.5 text-neutral-500 hover:text-neutral-900" title="Replace photo">
                                        <Replace size={15} />
                                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => replaceAt(i, e.target.files)} />
                                    </label>
                                    <button onClick={() => remove(i)} aria-label="Remove photo" className="p-1.5 text-neutral-500 hover:text-red-700">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#B9AE9B] bg-white/60 py-4 text-sm transition hover:bg-white">
                        <ImagePlus size={16} />
                        Add photos
                        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
                    </label>
                </section>

                {/* Live preview */}
                <section aria-label="Preview" className="lg:sticky lg:top-6 lg:self-start">
                    <p className="mb-3 text-sm text-neutral-500">Preview</p>
                    <div className="overflow-hidden rounded-xl border border-[#D8CFC0] bg-white">
                        <div className="flex items-center gap-1.5 border-b border-[#E7E1D6] px-4 py-2.5">
                            <span className="h-2 w-2 rounded-full bg-[#D8CFC0]" />
                            <span className="h-2 w-2 rounded-full bg-[#D8CFC0]" />
                            <span className="h-2 w-2 rounded-full bg-[#D8CFC0]" />
                        </div>

                        {tab === "portfolio" ? (
                            <div className="px-5 py-6">
                                <p className="text-center text-3xl font-light tracking-wide" style={serif}>
                                    Portfolio
                                </p>
                                <div className="mt-5 grid auto-rows-[84px] grid-cols-3 gap-1.5 [grid-auto-flow:dense]">
                                    {portfolio.map((img, i) => (
                                        <div key={img.id} className={`overflow-hidden rounded-lg bg-[#E7E1D6] ${i % 3 === 1 ? "row-span-2" : ""}`}>
                                            <img
                                                src={img.src}
                                                alt={img.alt}
                                                className="h-full w-full object-cover"
                                                style={{ objectPosition: img.position ?? "center" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {portfolio.length === 0 && (
                                    <p className="py-10 text-center text-sm text-neutral-500">No photos yet. Add some on the left.</p>
                                )}
                            </div>
                        ) : (
                            <div className="relative aspect-[16/10] bg-neutral-950">
                                {heroShown && (
                                    <img
                                        src={heroShown.src}
                                        alt={heroShown.alt}
                                        className="h-full w-full object-cover"
                                        style={{ objectPosition: heroShown.position ?? "center" }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                                    <p className="text-4xl font-light tracking-wide" style={serif}>
                                        AD Photography
                                    </p>
                                    <p className="mt-2 text-[9px] font-medium uppercase tracking-[0.35em] text-white/85">
                                        Wedding &amp; Portrait Photography, Cape Town
                                    </p>
                                    <span className="mt-5 border border-white/70 px-5 py-2 text-[8px] font-medium uppercase tracking-[0.25em]">
                                        Book a Session
                                    </span>
                                </div>
                                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                    {hero.map((h, i) => (
                                        <button
                                            key={h.id}
                                            onClick={() => setHeroIndex(i)}
                                            aria-label={`Preview slide ${i + 1}`}
                                            className="h-1 rounded-full transition-all"
                                            style={{
                                                width: i === heroIndex ? 18 : 5,
                                                backgroundColor: i === heroIndex ? "white" : "rgba(255,255,255,0.4)",
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {tab === "hero" && (
                        <p className="mt-3 text-xs text-neutral-500">Click a photo in the list or a dot to preview that slide.</p>
                    )}
                </section>
            </div>
        </main>
    );
}