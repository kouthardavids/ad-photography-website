import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { DashboardBooking } from "../lib/api/booking";

export type CancelReason =
    | "Client requested cancellation"
    | "Date no longer available"
    | "Payment not received"
    | "Business unavailable"
    | "Other";

const MAX_CUSTOM_REASON = 500;

interface CancelBookingModalProps {
    booking: DashboardBooking | null;
    reason: CancelReason | "";
    setReason: (reason: CancelReason | "") => void;
    customReason: string;
    setCustomReason: (value: string) => void;
    onClose: () => void;
    onCancel: () => void;
}

const serif = {
    fontFamily: "'Cormorant Garamond', serif",
} as const;

export default function CancelBookingModal({
    booking,
    reason,
    setReason,
    customReason,
    setCustomReason,
    onClose,
    onCancel,
}: CancelBookingModalProps) {
    const canCancel =
        reason !== "" && (reason !== "Other" || customReason.trim().length > 0);

    return (
        <AnimatePresence>
            {booking && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        data-lenis-prevent
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h2
                                    className="text-3xl font-light"
                                    style={serif}
                                >
                                    Cancel booking
                                </h2>

                                <p className="mt-2 text-sm text-neutral-600">
                                    Why are you cancelling{" "}
                                    <span className="font-medium text-neutral-900">
                                        {booking.name}
                                    </span>
                                    's booking?
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="cancel-reason"
                                className="text-sm font-medium"
                            >
                                Cancellation reason
                            </label>

                            <select
                                id="cancel-reason"
                                value={reason}
                                onChange={(e) =>
                                    setReason(
                                        e.target.value as CancelReason | ""
                                    )
                                }
                                className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm outline-none focus:border-neutral-900"
                            >
                                <option value="">
                                    Select a reason
                                </option>

                                <option value="Client requested cancellation">
                                    Client requested cancellation
                                </option>

                                <option value="Date no longer available">
                                    Date no longer available
                                </option>

                                <option value="Payment not received">
                                    Payment not received
                                </option>

                                <option value="Business unavailable">
                                    Business unavailable
                                </option>

                                <option value="Other">
                                    Other (type your own)
                                </option>
                            </select>

                            <AnimatePresence initial={false}>
                                {reason === "Other" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4">
                                            <label
                                                htmlFor="custom-reason"
                                                className="text-sm font-medium"
                                            >
                                                Type the reason
                                            </label>

                                            <textarea
                                                id="custom-reason"
                                                value={customReason}
                                                onChange={(e) =>
                                                    setCustomReason(
                                                        e.target.value.slice(
                                                            0,
                                                            MAX_CUSTOM_REASON
                                                        )
                                                    )
                                                }
                                                rows={4}
                                                maxLength={MAX_CUSTOM_REASON}
                                                placeholder="This message is included in the email to the client."
                                                className="mt-2 w-full resize-none rounded-lg border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-neutral-900"
                                            />

                                            <p className="mt-1 text-right text-xs text-neutral-400">
                                                {customReason.length}/{MAX_CUSTOM_REASON}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm transition hover:border-neutral-900"
                            >
                                Go back
                            </button>

                            <button
                                type="button"
                                disabled={!canCancel}
                                onClick={onCancel}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Cancel booking
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}