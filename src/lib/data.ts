
export const BRAND = {
    name: "AD Photography",
    tagline: "Wedding & Portrait Photography — Cape Town",
    email: "hello@adphotography.co.za",
    phone: "+27 82 000 0000",
    whatsapp: "https://wa.me/27820000000",
    areaServed: "Cape Town & the Western Cape",
    instagram: "https://instagram.com",
};

export type ShootType = "Wedding" | "Family" | "Portrait" | "Event";

export interface PortfolioImage {
    id: string;
    src: string;
    alt: string;
    type: ShootType;
}

export const PORTFOLIO_IMAGES: PortfolioImage[] = [
    { id: "p1", type: "Wedding", src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200", alt: "Bride laughing, veil in motion" },
    { id: "p2", type: "Portrait", src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200", alt: "Close portrait, soft window light" },
    { id: "p3", type: "Family", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200", alt: "Family walking on the beach" },
    { id: "p4", type: "Event", src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200", alt: "Guests toasting at reception" },
    { id: "p5", type: "Wedding", src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200", alt: "Couple walking at sunset" },
    { id: "p6", type: "Portrait", src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200", alt: "Studio portrait, dramatic light" },
    { id: "p7", type: "Family", src: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?q=80&w=1200", alt: "Family portrait outdoors" },
    { id: "p8", type: "Wedding", src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200", alt: "Wedding party candid moment" },
    { id: "p9", type: "Event", src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200", alt: "Live event candid" },
    { id: "p10", type: "Wedding", src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200", alt: "Wedding party candid moment" },
];

export interface Package {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
}

export const PACKAGES: Package[] = [
    {
        id: "essential",
        name: "Essential",
        price: "R 4,500",
        description: "A focused single-location session, ideal for portraits and small families.",
        features: ["1.5 hour session", "1 location", "40+ edited images", "Online gallery, 30-day access"],
    },
    {
        id: "signature",
        name: "Signature",
        price: "R 9,800",
        description: "Our most-booked package — full coverage for weddings and half-day events.",
        features: ["4 hour coverage", "2 locations", "150+ edited images", "Online gallery, 1-year access", "Print release included"],
        highlighted: true,
    },
    {
        id: "complete",
        name: "Complete",
        price: "R 16,500",
        description: "Full-day coverage for weddings that need the whole story told.",
        features: ["8 hour coverage", "Unlimited locations", "350+ edited images", "Online gallery, lifetime access", "Second shooter included", "Printed album (20 pages)"],
    },
];

export const FAQS: { q: string; a: string }[] = [
    { q: "How much is the deposit?", a: "A 30% non-refundable deposit secures your date. The remainder is due 7 days before your session." },
    { q: "How long until I get my photos?", a: "Portrait and family sessions: 7–10 working days. Weddings: 4–6 weeks for the full edited gallery, with a same-week sneak peek." },
    { q: "What should we wear?", a: "Stick to solid colours and soft tones — we'll send a full styling guide once you book." },
    { q: "Can I reschedule?", a: "Yes, once free of charge with at least 14 days' notice. See your booking confirmation for the full policy." },
];

export const TESTIMONIALS = [
    { name: "Amara & Sipho", role: "Wedding, Franschhoek", quote: "Every photo felt like it happened by accident — in the best way. We didn't feel photographed at all." },
    { name: "Lindiwe M.", role: "Family session, Kirstenbosch", quote: "Patient with three kids under seven, which is basically a miracle. The gallery made us all cry." },
    { name: "Chris & Wian", role: "Portraits, Sea Point", quote: "Relaxed the whole time, and somehow the photos still look editorial." },
];