import { useEffect } from "react";
import { Mail, X } from "lucide-react";

type BookingModalProps = {
    open: boolean;
    email: string;
    onClose: () => void;
};

export default function BookingModal({ open, email, onClose }: BookingModalProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-modal-title"
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-lg bg-white px-8 py-10 text-center shadow-xl"
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-4 top-4 text-neutral-400 transition hover:text-neutral-900"
                >
                    <X size={18} />
                </button>

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <Mail size={20} />
                </div>

                <h2
                    id="booking-modal-title"
                    className="mt-6 text-3xl text-neutral-900"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    Request received
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    If your booking is confirmed, we will send a confirmation email to{" "}
                    <span className="font-medium text-neutral-900">{email}</span>.
                </p>

                <button
                    onClick={onClose}
                    className="mt-8 w-full border border-neutral-900 bg-neutral-900 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}