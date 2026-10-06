import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { DashboardBooking } from "../lib/api/booking";

interface ConfirmBookingModalProps {
    booking: DashboardBooking | null;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

const serif = {
    fontFamily: "'Cormorant Garamond', serif",
} as const;

export default function ConfirmBookingModal({
    booking,
    onClose,
    onConfirm,
}: ConfirmBookingModalProps) {
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
                                    Confirm booking
                                </h2>

                                <p className="mt-2 text-sm text-neutral-600">
                                    Are you sure you want to confirm{" "}
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

                        <div className="mt-6 rounded-xl bg-[#F3EEE6] p-4">
                            <p className="text-sm text-neutral-500">
                                Booking
                            </p>

                            <p className="mt-1 font-medium">
                                {booking.name}
                            </p>

                            <p className="mt-1 text-sm text-neutral-600">
                                {booking.package.name}
                            </p>

                            <p className="mt-1 text-sm text-neutral-600">
                                {booking.package.price.toLocaleString("en-ZA", {
                                    style: "currency",
                                    currency: "ZAR",
                                    maximumFractionDigits: 0,
                                })}
                            </p>

                            <p className="mt-2 text-sm text-neutral-500">
                                Date:{" "}
                                {new Date(
                                    booking.date + "T00:00:00"
                                ).toLocaleDateString("en-ZA", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
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
                                onClick={onConfirm}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm text-white transition hover:bg-green-700"
                            >
                                <Check size={15} />
                                Confirm booking
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}