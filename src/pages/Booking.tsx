import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { PACKAGES } from "../lib/data";

const STEPS = ["Package", "Date & Time", "Your Details"];
const TIME_SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"];

// Mock unavailable dates (YYYY-MM-DD) — replace with real availability from your calendar API.
const UNAVAILABLE = new Set(["2026-08-20", "2026-08-21", "2026-08-27"]);

export default function Booking() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    const [packageId, setPackageId] = useState(params.get("package") ?? PACKAGES[1].id);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

    const today = dayjs().startOf("day");
    const selectedDateKey = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;
    const selectedPackage = PACKAGES.find((p) => p.id === packageId) ?? PACKAGES[1];

    function isDateUnavailable(date: Dayjs) {
        return date.isBefore(today, "day") || UNAVAILABLE.has(date.format("YYYY-MM-DD"));
    }

    const canContinue =
        (step === 0 && !!packageId) ||
        (step === 1 && !!selectedDate && !!selectedTime) ||
        (step === 2 && !!form.name && !!form.email && !!form.phone);

    function handleConfirm() {
        // TODO: POST to your booking API, then redirect with a real reference number.
        const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
        navigate(
            `/booking/confirmation?ref=${ref}&package=${packageId}&date=${selectedDateKey}&time=${selectedTime}`
        );
    }

    return (
        <div>
            <Nav />

            <section className="mx-auto max-w-2xl px-6 py-16">
                <h1 className="text-center text-4xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Book a Session
                </h1>

                {/* Step indicator */}
                <div className="mt-10 flex items-center justify-center gap-2">
                    {STEPS.map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${i < step
                                    ? "bg-neutral-900 text-white"
                                    : i === step
                                        ? "border-2 border-neutral-900 text-neutral-900"
                                        : "border border-neutral-300 text-neutral-400"
                                    }`}
                            >
                                {i < step ? <Check size={14} /> : i + 1}
                            </div>
                            <span className={`hidden text-xs sm:inline ${i === step ? "text-neutral-900" : "text-neutral-400"}`}>
                                {label}
                            </span>
                            {i < STEPS.length - 1 && <div className="mx-1 h-px w-6 bg-neutral-300 sm:w-10" />}
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-center text-xs text-neutral-400">
                    Step {step + 1} of {STEPS.length}
                </p>

                {/* Step 1: Package */}
                {step === 0 && (
                    <div className="mt-10 space-y-3">
                        {PACKAGES.map((pkg) => (
                            <button
                                key={pkg.id}
                                onClick={() => setPackageId(pkg.id)}
                                className={`flex w-full items-center justify-between border px-5 py-4 text-left transition ${packageId === pkg.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
                                    }`}
                            >
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">{pkg.name}</p>
                                    <p className="text-xs text-neutral-500">{pkg.description}</p>
                                </div>
                                <p className="text-sm font-medium text-neutral-900">{pkg.price}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Date & time */}
                {step === 1 && (
                    <div className="mt-10">
                        <div className="flex justify-center">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        setSelectedDate(newValue);
                                        setSelectedTime(null);
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
                                <div className="mt-3 flex flex-wrap justify-center gap-2">
                                    {TIME_SLOTS.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTime(t)}
                                            className={`border px-4 py-2 text-sm transition ${selectedTime === t
                                                ? "border-neutral-900 bg-neutral-900 text-white"
                                                : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Contact details */}
                {step === 2 && (
                    <div className="mt-10 space-y-4">
                        <input
                            placeholder="Full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />
                        <textarea
                            placeholder="Anything we should know? (optional)"
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
                        />

                        <div className="border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm">
                            <p className="font-medium text-neutral-900">{selectedPackage.name} — {selectedPackage.price}</p>
                            <p className="text-neutral-500">
                                {selectedDateKey} at {selectedTime}
                            </p>
                        </div>
                    </div>
                )}

                {/* Nav buttons — one obvious primary action */}
                <div className="mt-10 flex items-center justify-between">
                    <button
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        className={`text-xs uppercase tracking-[0.15em] text-neutral-500 ${step === 0 ? "invisible" : ""}`}
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
                            className="border border-neutral-900 bg-neutral-900 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                        >
                            Confirm Booking
                        </button>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}