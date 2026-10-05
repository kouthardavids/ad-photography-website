import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export type CancelReason =
    | "Client requested cancellation"
    | "Date no longer available"
    | "Payment not received"
    | "Business unavailable"
    | "Other";

interface FollowUp {
    id: string;
    name: string;
    note: string;
    due: string;
    phone: string;
    email: string;
}

interface CancelBookingModalProps {
    booking: FollowUp | null;
    reason: CancelReason | "";
    setReason: (reason: CancelReason | "") => void;
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
    onClose,
    onCancel,
}: CancelBookingModalProps) {
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
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
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
                                    Other
                                </option>
                            </select>
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
                                disabled={!reason}
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