import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "deals-popup";
const SNOOZE_DAYS = 7;

function shouldSkip() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const { status, at } = JSON.parse(raw) as { status: "subscribed" | "dismissed"; at: number };
        if (status === "subscribed") return true;
        return Date.now() - at < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

// function remember(status: "subscribed" | "dismissed") {
//     try {
//         localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
//     } catch {
//         /* storage blocked, popup may show again next visit */
//     }
// }

// Replace with a real call, e.g. POST to your API so the email lands in your CRM as a lead.
async function subscribe(email: string) {
    await new Promise((r) => setTimeout(r, 400));
    console.log("Subscribed:", email);
}

export default function DealsPopup({ targetId }: { targetId: string }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const firedRef = useRef(false);

    // Open once the visitor has scrolled past the target section
    useEffect(() => {
        if (shouldSkip()) return;
        const el = document.getElementById(targetId);
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            const passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
            if (passed && !firedRef.current) {
                firedRef.current = true;
                observer.disconnect();
                setTimeout(() => setOpen(true), 500);
            }
        });

        observer.observe(el);
        return () => observer.disconnect();
    }, [targetId]);

    // Focus the field on open, close on Escape
    useEffect(() => {
        if (!open) return;
        inputRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const close = () => {
        setOpen(false);
        // if (!done) remember("dismissed");
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Enter a valid email address, like name@example.com.");
            return;
        }
        setError("");
        setSending(true);
        try {
            await subscribe(email);
            // remember("subscribed");
            setDone(true);
            setTimeout(() => setOpen(false), 3500);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={close}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="deals-title"
                        className="relative w-full max-w-md bg-[#F3EEE6] p-8 text-center text-neutral-900"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={close}
                            aria-label="Close"
                            className="absolute right-4 top-4 text-neutral-500 transition hover:text-neutral-900"
                        >
                            <X size={18} />
                        </button>

                        {done ? (
                            <div className="py-6">
                                <h2
                                    id="deals-title"
                                    className="text-3xl font-light tracking-wide"
                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                >
                                    Check your inbox
                                </h2>
                                <p className="mt-3 text-sm text-neutral-600">
                                    Your 10% code is on its way. If it isn't there in a few minutes, check your spam folder.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2
                                    id="deals-title"
                                    className="text-3xl font-light tracking-wide sm:text-4xl"
                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                >
                                    Get 10% off your first session
                                </h2>
                                <p className="mt-3 text-sm text-neutral-600">
                                    Join the list and we'll email your code straight away. You'll also hear about open
                                    dates and special offers before we share them anywhere else.
                                </p>

                                <form onSubmit={submit} className="mt-6" noValidate>
                                    <label htmlFor="deals-email" className="sr-only">
                                        Email address
                                    </label>
                                    <input
                                        ref={inputRef}
                                        id="deals-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Your email address"
                                        aria-invalid={!!error}
                                        aria-describedby={error ? "deals-error" : undefined}
                                        className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                                    />
                                    {error && (
                                        <p id="deals-error" className="mt-2 text-left text-xs text-red-700">
                                            {error}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="mt-4 w-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-neutral-900 disabled:opacity-60"
                                    >
                                        {sending ? "Sending" : "Send me my 10%"}
                                    </button>
                                </form>

                                <p className="mt-3 text-xs text-neutral-500">
                                    One or two emails a month. Unsubscribe any time.
                                </p>

                                <button
                                    onClick={close}
                                    className="mt-4 text-xs text-neutral-500 underline-offset-4 hover:underline"
                                >
                                    Maybe later
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}