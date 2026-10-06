export const BRAND = {
    name: "AD Photography",
    tagline: "Wedding & Portrait Photography — Cape Town, South Africa",
    email: "adphoto.design1976@gmail.com",
    phone: "+27 64 908 2109",
    areaServed: "Cape Town & the Western Cape",
    instagram: "https://www.instagram.com/davids.aneesa__adphotography/",
};

export type ShootType = "Wedding" | "Family" | "Portrait" | "Event";

export interface PortfolioImage {
    id: string;
    src: string;
    alt: string;
    type: ShootType;
    position?: string;
    mobilePosition?: string;
}

export const PORTFOLIO_IMAGES: PortfolioImage[] = [
    { id: "p1", type: "Wedding", src: "/images/DSC_0811 2.jpg", alt: "Bride laughing, veil in motion", position: "center 45%" },
    { id: "p2", type: "Portrait", src: "/images/DSC_0734.jpg", alt: "Close portrait, soft window light", position: "75% center", mobilePosition: "35% center" },
    { id: "p3", type: "Family", src: "./images/images.png", alt: "Family walking on the beach" },
    { id: "p4", type: "Event", src: "./images/DSC_0509.webp", alt: "Guests toasting at reception", position: "center 29%" },
    { id: "p5", type: "Wedding", src: "./images/DSC_0512.webp", alt: "Couple walking at sunset" },
    { id: "p6", type: "Portrait", src: "./images/DSC_0570.webp", alt: "Studio portrait, dramatic light", position: "center 5%" },
    { id: "p7", type: "Family", src: "./images/DSC_0834.jpg", alt: "Family portrait outdoors" },

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
        id: "standard",
        name: "Standard",
        price: "R800/hour",
        description: "A simple one-hour photography session, ideal for portraits, birthdays, and small family shoots.",
        features: [
            "1 hour session",
            "1 location",
            "Edited images",
            "Online gallery",
        ],
    },
    {
        id: "signature",
        name: "Signature",
        price: "From R 1,500",
        description: "Extended photography coverage for clients who want more time to capture their special moments.",
        features: [
            "2+ hour session",
            "Location-dependent discount",
            "1-2 locations available",
            "Edited images",
            "Online gallery",
        ],
        highlighted: true,
    },
    {
        id: "wedding",
        name: "Wedding",
        price: "From R 3,500",
        description: "Photography coverage for your special day, with pricing adjusted according to the location and coverage required.",
        features: [
            "Wedding photography coverage",
            "Location-dependent pricing",
            "Flexible coverage duration",
            "Edited images",
            "Online gallery",
        ],
    },
];

export const FAQS: { q: string; a: string }[] = [
    { q: "How much is the deposit?", a: "A 50% non-refundable deposit secures your date. \n\nThe remaining 50% is due on the day of your shoot, before the session begins." },
    { q: "How long until I get my photos?", a: "Standard and Signature packages: 7–10 working days. \n\nWeddings: 4–8 weeks for the full edited gallery." },
    { q: "Can I reschedule?", a: "Yes, once free of charge with at least 14 days' notice." },
    {
        q: "How can I book a date?",
        a: "1. Click the \"Book a Session\" button, or choose a package in the Services & Pricing section.\n\n2. Select your package.\n\n3. Pick your preferred date and time. Standard sessions allow one time slot, while Signature and Wedding let you select more than one.\n\n4. Enter your name, email and phone number, and add any special requests.\n\n5. Review your summary and click \"Confirm Booking\".",
    },
    {
        q: "How can I make a payment?",
        a: "A 50% deposit is required to secure and confirm your booking. Your date will only be reserved once the deposit has been received via EFT. The remaining 50% is due on the day of your shoot, before the session begins.\n\nFor weddings, payment terms may vary depending on the package and coverage required. These details will be discussed and confirmed when booking.\n\nPayment details will be provided after your booking request is received.",
    }
];

export const TESTIMONIALS = [
    { name: "~ Amara & Sipho", quote: "Extremely happy🎆🥹❤️ Thank you so much ❤️❤️. You really out done yourself 🥹❤️" },
    { name: "~ N@sh", quote: "Yeeeees it's amazing 😍 I'm so happy 😊😁" },
    { name: "~ Shannon", quote: "Gorgeous photos ! Thank you so much for today ❤️❤️❤️" },
];