import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2, Mail, Phone } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

import { getPackages } from "../lib/api/packages";
import type { Package } from "../lib/api/packages";
import { createBooking } from "../lib/api/booking";
import { getBookedSlots } from "../lib/api/slots";

import { isValidEmail, normalizeSAPhone } from "../lib/validation";

import BookingModal from "../components/BookingModal";

const STEPS = ["Package", "Date & Time", "Your Details"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const UNAVAILABLE = new Set(["2026-08-20", "2026-08-21", "2026-08-27"]);

function StepIndicator({ step }: { step: number }) {
    return (
        <div className="flex items-center">
            {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${i < step
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : i === step
                                    ? "border-neutral-900 bg-white"
                                    : "border-neutral-200 bg-white"
                                }`}
                        >
                            {i < step ? (
                                <Check size={14} />
                            ) : i === step ? (
                                <span className="h-2 w-2 rounded-full bg-neutral-900" />
                            ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
                            )}
                        </div>
                        <span
                            className={`hidden text-[10px] font-medium uppercase tracking-[0.15em] sm:block ${i <= step ? "text-neutral-900" : "text-neutral-300"
                                }`}
                        >
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className={`mx-2 h-px flex-1 transition-colors duration-300 ${i < step ? "bg-neutral-900" : "bg-neutral-200"
                                }`}
                            style={{ marginBottom: "20px" }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function Booking() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [packageId, setPackageId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
    const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success">("idle");
    const [showModal, setShowModal] = useState(false);

    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsVersion, setSlotsVersion] = useState(0);

    const [touched, setTouched] = useState({ email: false, phone: false });

    const today = dayjs().startOf("day");
    const selectedDateKey = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;
    const selectedPackage = packages.find((p) => p.id === packageId);
    const isSingleSelect = selectedPackage?.id === 1;

    useEffect(() => {
        if (isSingleSelect) {
            setSelectedTimes((prev) => (prev.length > 1 ? prev.slice(0, 1) : prev));
        }
    }, [isSingleSelect]);

    useEffect(() => {
        const loadPackages = async () => {
            setLoadingPackages(true);

            try {
                const data = await getPackages();

                setPackages(data);

                const packageFromUrl = params.get("package");

                if (packageFromUrl) {
                    const selected = data.find(
                        (pkg) => pkg.id === Number(packageFromUrl)
                    );

                    if (selected) {
                        setPackageId(selected.id);
                        return;
                    }
                }

                setPackageId(data[0]?.id ?? null);
            } catch (error) {
                console.error("Failed to load packages:", error);
            } finally {
                setLoadingPackages(false);
            }
        };

        loadPackages();
    }, [params]);

    useEffect(() => {
        if (!selectedDateKey) {
            setBookedTimes([]);
            return;
        }

        let cancelled = false;
        setLoadingSlots(true);

        getBookedSlots(selectedDateKey)
            .then((times) => {
                if (cancelled) return;
                setBookedTimes(times);
                // drop any selected time that turned out to be taken
                setSelectedTimes((prev) => prev.filter((t) => !times.includes(t)));
            })
            .catch((error) => {
                console.error("Failed to load booked slots:", error);
            })
            .finally(() => {
                if (!cancelled) setLoadingSlots(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedDateKey, slotsVersion]);

    // Open the modal shortly after the tick animation plays
    useEffect(() => {
        if (submitStatus !== "success") return;

        const timer = setTimeout(() => setShowModal(true), 1100);
        return () => clearTimeout(timer);
    }, [submitStatus]);

    const toggleTime = (t: string) => {
        setSelectedTimes((prev) => {
            if (isSingleSelect) {
                return prev[0] === t ? [] : [t];
            }
            return prev.includes(t)
                ? prev.filter((x) => x !== t)
                : [...prev, t].sort();
        });
    }

    function isDateUnavailable(date: Dayjs) {
        return date.isBefore(today, "day") || UNAVAILABLE.has(date.format("YYYY-MM-DD"));
    }

    const emailValid = isValidEmail(form.email);
    const normalizedPhone = normalizeSAPhone(form.phone);
    const phoneValid = normalizedPhone !== null;

    const canContinue =
        (step === 0 && !!packageId) ||
        (step === 1 && !!selectedDate && selectedTimes.length > 0) ||
        (step === 2 && !!form.name.trim() && emailValid && phoneValid);

    const handleConfirm = async () => {
        if (!selectedPackage || !selectedDateKey || submitStatus !== "idle") {
            return;
        }

        setSubmitStatus("loading");

        try {
            const result = await createBooking({
                package_id: selectedPackage.id,
                date: selectedDateKey,
                name: form.name,
                email: form.email,
                phone: normalizedPhone!,
                notes: form.notes,
                times: selectedTimes,
            });
            setConfirmedRef(result.data.ref);
            setSubmitStatus("success");
        } catch (error) {
            console.error("Booking failed:", error);
            setSubmitStatus("idle");
            alert(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while creating your booking."
            );
        }
    };

    const handleCloseModal = () => {
        navigate(
            `/`
        );
    }

    const inputClass =
        "w-full rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900";

    return (
        <div data-nav-theme="light" className="min-h-screen bg-white">
            <div className="fixed inset-y-0 left-0 hidden w-1/3 lg:block">
                <img
                    src="./images/DSC_0539.webp"
                    alt="Bride laughing in golden light"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="lg:ml-[33.333%]">
                <section className="mx-auto max-w-3xl px-8 py-28 sm:py-32 lg:px-16">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Step {step + 1} of {STEPS.length}
                        </p>
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-900"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    <h1
                        className="mt-4 text-5xl text-neutral-900"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        Book a Session
                    </h1>

                    <div className="mt-10">
                        <StepIndicator step={step} />
                    </div>

                    {step === 0 && (
                        <div className="mt-12">
                            {loadingPackages ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2
                                        size={24}
                                        className="animate-spin text-neutral-900"
                                    />

                                    <p className="mt-4 text-sm text-neutral-500">
                                        Loading packages...
                                    </p>
                                </div>
                            ) : packages.length === 0 ? (
                                <div className="py-16 text-center">
                                    <p className="text-sm text-neutral-500">
                                        No packages are currently available.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {packages.map((pkg) => (
                                        <button
                                            key={pkg.id}
                                            onClick={() => setPackageId(pkg.id)}
                                            className={`flex w-full items-center justify-between rounded-lg border px-6 py-5 text-left transition ${packageId === pkg.id
                                                ? "border-neutral-900 bg-white shadow-sm"
                                                : "border-neutral-200 bg-white hover:border-neutral-300"
                                                }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <span
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${packageId === pkg.id
                                                        ? "border-neutral-900 bg-neutral-900"
                                                        : "border-neutral-300"
                                                        }`}
                                                >
                                                    {packageId === pkg.id && (
                                                        <span className="h-2 w-2 rounded-full bg-white" />
                                                    )}
                                                </span>

                                                <div className="min-w-0">
                                                    <p className="text-base font-medium text-neutral-900">
                                                        {pkg.name}
                                                    </p>

                                                    <p className="text-sm text-neutral-500">
                                                        {pkg.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="ml-6 shrink-0 whitespace-nowrap text-base font-medium text-neutral-900">
                                                R{pkg.price}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="mt-12">
                            <div className="flex justify-center rounded-lg border border-neutral-200 bg-white p-2">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateCalendar
                                        value={selectedDate}
                                        onChange={(newValue) => {
                                            setSelectedDate(newValue);
                                            setSelectedTimes([]);
                                        }}
                                        shouldDisableDate={isDateUnavailable}
                                        disablePast
                                        sx={{
                                            "& .MuiPickersDay-root.Mui-selected": {
                                                backgroundColor: "#171717",
                                                "&:hover, &:focus": { backgroundColor: "#171717" },
                                            },
                                            "& .MuiPickersDay-today": {
                                                borderColor: "#171717",
                                            },
                                            "& .MuiPickersCalendarHeader-label": {
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontSize: "1.1rem",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </div>

                            {selectedDate && (
                                <div className="mt-8">
                                    <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
                                        Available times
                                    </p>
                                    <p className="mt-1 text-center text-xs text-neutral-400">
                                        {isSingleSelect ? "Select one time" : "Select one or more"}
                                    </p>
                                    {loadingSlots ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <Loader2
                                                size={22}
                                                className="animate-spin text-neutral-900"
                                            />

                                            <p className="mt-3 text-xs text-neutral-500">
                                                Checking available times...
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                                            {TIME_SLOTS.map((t) => {
                                                const active = selectedTimes.includes(t);
                                                const booked = bookedTimes.includes(t);

                                                return (
                                                    <button
                                                        key={t}
                                                        onClick={() => toggleTime(t)}
                                                        disabled={booked}
                                                        aria-pressed={active}
                                                        title={booked ? "Already booked" : undefined}
                                                        className={`rounded-md border px-4 py-2 text-sm transition disabled:cursor-not-allowed ${booked
                                                                ? "border-neutral-200 bg-neutral-100 text-neutral-300 line-through"
                                                                : active
                                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900"
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {!loadingSlots && bookedTimes.length === TIME_SLOTS.length && (
                                        <p className="mt-4 text-center text-xs text-neutral-500">
                                            This date is fully booked. Please choose another day.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="mt-12 space-y-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                                        Full Name
                                    </label>
                                    <input
                                        placeholder="Jane Doe"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            type="email"
                                            placeholder="jane@email.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                                            className={`${inputClass} pl-11 ${touched.email && !emailValid ? "border-red-400 focus:border-red-500" : ""}`}
                                        />
                                    </div>
                                    {touched.email && !emailValid && (
                                        <p className="mt-1 text-xs text-red-500">Enter a valid email address.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                                    Phone
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="tel"
                                        placeholder="082 123 4567"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                        className={`${inputClass} pl-11 ${touched.phone && !phoneValid ? "border-red-400 focus:border-red-500" : ""}`}
                                    />
                                </div>
                                {touched.phone && !phoneValid && (
                                    <p className="mt-1 text-xs text-red-500">
                                        Enter a valid South African number, e.g. 082 123 4567.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
                                    Anything we should know?
                                </label>
                                <textarea
                                    placeholder="Optional — vision, locations, special requests..."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={3}
                                    className={inputClass}
                                />
                            </div>

                            <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4 text-sm">
                                <p className="font-medium text-neutral-900">
                                    {selectedPackage?.name} — {selectedPackage?.price}
                                </p>
                                <p className="text-neutral-500">
                                    {selectedDateKey} at {selectedTimes.join(", ")}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 flex items-center justify-between">
                        <button
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            className={`text-xs uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-900 ${step === 0 || submitStatus !== "idle" ? "invisible" : ""
                                }`}
                        >
                            ← Back
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => setStep((s) => s + 1)}
                                disabled={!canContinue}
                                className="border border-neutral-900 bg-neutral-900 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirm}
                                disabled={!canContinue}
                                aria-busy={submitStatus === "loading"}
                                className={`flex h-[46px] items-center justify-center overflow-hidden border text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-all duration-500 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300 ${submitStatus === "success"
                                    ? "w-[46px] rounded-full border-emerald-600 bg-emerald-600"
                                    : "w-[190px] border-neutral-900 bg-neutral-900"
                                    } ${submitStatus !== "idle" ? "pointer-events-none" : ""}`}
                            >
                                {submitStatus === "idle" && (
                                    <span className="whitespace-nowrap">Confirm Booking</span>
                                )}

                                {submitStatus === "loading" && (
                                    <Loader2 size={18} className="animate-spin" />
                                )}

                                {submitStatus === "success" && (
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 13l4 4L19 7" className="animate-draw-check" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </section>
            </div>
            <BookingModal
                open={showModal}
                email={form.email}
                onClose={handleCloseModal}
            />
        </div>
    );
}