import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

import { getBookedSlots } from "../lib/api/slots";
import type { DashboardBooking } from "../lib/api/booking";

interface RescheduleBookingModalProps {
    booking: DashboardBooking | null;
    onClose: () => void;
    onReschedule: (
        date: string,
        times: string[]
    ) => Promise<void>;
}

const TIME_SLOTS = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
];

const UNAVAILABLE = new Set([
    "2026-08-20",
    "2026-08-21",
    "2026-08-27",
]);

function isDateUnavailable(date: Dayjs) {
    const today = dayjs().startOf("day");

    return (
        date.isBefore(today, "day") ||
        UNAVAILABLE.has(date.format("YYYY-MM-DD"))
    );
}

function formatDate(date: string) {
    return dayjs(date).format("dddd, D MMMM YYYY");
}

export default function RescheduleBookingModal({
    booking,
    onClose,
    onReschedule,
}: RescheduleBookingModalProps) {
    const [selectedDate, setSelectedDate] =
        useState<Dayjs | null>(null);

    const [selectedTimes, setSelectedTimes] =
        useState<string[]>([]);

    const [bookedTimes, setBookedTimes] =
        useState<string[]>([]);

    const [loadingSlots, setLoadingSlots] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * When a booking is selected for rescheduling,
     * initialise the calendar and selected times
     * using the existing booking.
     */
    useEffect(() => {
        if (!booking) {
            setSelectedDate(null);
            setSelectedTimes([]);
            setBookedTimes([]);
            setError("");
            return;
        }

        setSelectedDate(dayjs(booking.date));
        setSelectedTimes(booking.times);
        setError("");
    }, [booking]);

    /*
     * Load booked slots using the SAME API as Booking.tsx.
     */
    useEffect(() => {
        if (!booking || !selectedDate) {
            setBookedTimes([]);
            return;
        }

        const selectedDateKey =
            selectedDate.format("YYYY-MM-DD");

        let cancelled = false;

        setLoadingSlots(true);
        setError("");

        getBookedSlots(selectedDateKey)
            .then((times) => {
                if (cancelled) return;

                setBookedTimes(times);
            })
            .catch((error) => {
                if (cancelled) return;

                console.error(
                    "Failed to load booked slots:",
                    error
                );

                setBookedTimes([]);
                setError(
                    "Could not load available times."
                );
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingSlots(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [booking, selectedDate]);

    if (!booking) {
        return null;
    }

    const selectedDateKey = selectedDate
        ? selectedDate.format("YYYY-MM-DD")
        : null;

    /*
     * The current booking's times are technically returned
     * as "booked" by the API.
     *
     * We allow them because they belong to THIS booking.
     */
    const currentBookingTimes =
        selectedDateKey === booking.date
            ? booking.times
            : [];

    const toggleTime = (time: string) => {
        setSelectedTimes((prev) => {
            if (prev.includes(time)) {
                return prev.filter(
                    (item) => item !== time
                );
            }

            return [...prev, time].sort();
        });
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setSelectedDate(newValue);

        if (!newValue) {
            setSelectedTimes([]);
            return;
        }

        const newDate =
            newValue.format("YYYY-MM-DD");

        /*
         * If returning to the original booking date,
         * restore its original times.
         *
         * Otherwise start with no times selected.
         */
        if (newDate === booking.date) {
            setSelectedTimes(booking.times);
        } else {
            setSelectedTimes([]);
        }

        setError("");
    };

    const handleReschedule = async () => {
        if (!selectedDateKey) {
            setError("Please select a date.");
            return;
        }

        if (selectedTimes.length === 0) {
            setError(
                "Please select at least one available time."
            );
            return;
        }

        setSaving(true);
        setError("");

        try {
            await onReschedule(
                selectedDateKey,
                selectedTimes
            );
        } catch (error) {
            console.error(
                "Failed to reschedule booking:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to reschedule booking."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#E7E1D6] p-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-medium text-neutral-900">
                                Reschedule booking
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-neutral-500">
                            {booking.name} · {booking.ref}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Current booking */}
                    <div className="rounded-xl bg-[#F3EEE6] p-5">
                        <p className="text-xs font-medium uppercase tracking-[0.15em] text-neutral-400">
                            Current booking
                        </p>

                        <p className="mt-2 text-base font-medium text-neutral-900">
                            {formatDate(booking.date)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {booking.times.map((time) => (
                                <span
                                    key={time}
                                    className="rounded-md border border-emerald-600 bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700"
                                >
                                    {time}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="mt-8">
                        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
                            Select a new date
                        </p>

                        <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-2">
                            <LocalizationProvider
                                dateAdapter={AdapterDayjs}
                            >
                                <DateCalendar
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    shouldDisableDate={
                                        isDateUnavailable
                                    }
                                    disablePast
                                    sx={{
                                        "& .MuiPickersDay-root.Mui-selected":
                                        {
                                            backgroundColor:
                                                "#171717",

                                            "&:hover, &:focus":
                                            {
                                                backgroundColor:
                                                    "#171717",
                                            },
                                        },

                                        "& .MuiPickersDay-today":
                                        {
                                            borderColor:
                                                "#171717",
                                        },

                                        "& .MuiPickersCalendarHeader-label":
                                        {
                                            fontFamily:
                                                "'Cormorant Garamond', serif",

                                            fontSize:
                                                "1.1rem",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </div>

                        {/* Calendar legend */}
                        <div className="mt-4 flex justify-center gap-5 text-xs text-neutral-500">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-neutral-900" />
                                Selected date
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                                Current booking
                            </div>
                        </div>
                    </div>

                    {/* Selected date */}
                    {selectedDate && (
                        <div className="mt-8">
                            <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
                                Available times
                            </p>

                            <p className="mt-1 text-center text-xs text-neutral-400">
                                Select one or more
                            </p>

                            <p className="mt-2 text-center text-sm font-medium text-neutral-900">
                                {selectedDate.format(
                                    "dddd, D MMMM YYYY"
                                )}
                            </p>

                            {/* Loading */}
                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2
                                        size={22}
                                        className="animate-spin text-neutral-900"
                                    />

                                    <p className="mt-3 text-xs text-neutral-500">
                                        Checking available
                                        times...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                                        {TIME_SLOTS.map((time) => {
                                            const active = selectedTimes.includes(time);

                                            const isCurrentBookingTime =
                                                currentBookingTimes.includes(time);

                                            const isBookedByAnotherBooking =
                                                bookedTimes.includes(time) &&
                                                !isCurrentBookingTime;

                                            return (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isBookedByAnotherBooking) {
                                                            return;
                                                        }

                                                        toggleTime(time);
                                                    }}
                                                    disabled={isBookedByAnotherBooking}
                                                    aria-pressed={active}
                                                    title={
                                                        isBookedByAnotherBooking
                                                            ? "Already booked"
                                                            : undefined
                                                    }
                                                    className={`rounded-md border px-4 py-2 text-sm transition ${isBookedByAnotherBooking
                                                            ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300 line-through"
                                                            : active
                                                                ? isCurrentBookingTime
                                                                    ? "border-emerald-600 bg-emerald-100 font-medium text-emerald-700"
                                                                    : "border-neutral-900 bg-neutral-900 text-white"
                                                                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900"
                                                        }`}
                                                >
                                                    {time}

                                                    {isCurrentBookingTime && active && (
                                                        <span className="ml-1">✓</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {bookedTimes.length ===
                                        TIME_SLOTS.length && (
                                            <p className="mt-4 text-center text-xs text-neutral-500">
                                                This date is
                                                fully booked.
                                                Please choose
                                                another day.
                                            </p>
                                        )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-neutral-300 px-5 py-2.5 text-sm transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleReschedule}
                            disabled={
                                saving ||
                                !selectedDate ||
                                selectedTimes.length === 0
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2
                                        size={15}
                                        className="animate-spin"
                                    />
                                    Rescheduling...
                                </>
                            ) : (
                                <>
                                    <Check size={15} />
                                    Reschedule booking
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}