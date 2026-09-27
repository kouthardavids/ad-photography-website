import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Mail, Phone } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PACKAGES } from "../lib/data";

const STEPS = ["Package", "Date & Time", "Your Details"];
const TIME_SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"];

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
        const ref = Math.random().toString(36).slice(2, 8).toUpperCase();
        navigate(
            `/booking/confirmation?ref=${ref}&package=${packageId}&date=${selectedDateKey}&time=${selectedTime}`
        );
    }

    const inputClass =
        "w-full rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900";

    return (
        <div data-nav-theme="light" className="min-h-screen bg-white">
            <div className="fixed inset-y-0 left-0 hidden w-1/3 lg:block">
                <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2400"
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
                        <div className="mt-12 space-y-3">
                            {PACKAGES.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => setPackageId(pkg.id)}
                                    className={`flex w-full items-center justify-between rounded-lg border px-6 py-5 text-left transition ${packageId === pkg.id
                                        ? "border-neutral-900 bg-white shadow-sm"
                                        : "border-neutral-200 bg-white hover:border-neutral-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
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
                                        <div>
                                            <p className="text-base font-medium text-neutral-900">{pkg.name}</p>
                                            <p className="text-sm text-neutral-500">{pkg.description}</p>
                                        </div>
                                    </div>
                                    <p className="text-base font-medium text-neutral-900">{pkg.price}</p>
                                </button>
                            ))}
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
                                                className={`rounded-md border px-4 py-2 text-sm transition ${selectedTime === t
                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900"
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
                                            className={`${inputClass} pl-11`}
                                        />
                                    </div>
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
                                        placeholder="+27 00 000 0000"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className={`${inputClass} pl-11`}
                                    />
                                </div>
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
                                    {selectedPackage.name} — {selectedPackage.price}
                                </p>
                                <p className="text-neutral-500">
                                    {selectedDateKey} at {selectedTime}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 flex items-center justify-between">
                        <button
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            className={`text-xs uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-900 ${step === 0 ? "invisible" : ""
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
                                className="border border-neutral-900 bg-neutral-900 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                            >
                                Confirm Booking
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}