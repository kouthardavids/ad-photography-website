import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Check, MessageCircle, Plus, Search, X } from "lucide-react";
import DeliverPhotos from "./DeliverPhotos";
import WebsiteImages from "./WebsiteImages";

import CancelBookingModal from "../components/CancelBookingModal";
import type { CancelReason } from "../components/CancelBookingModal";
import ConfirmBookingModal from "../components/ConfirmBookingModal";
import RescheduleBookingModal from "../components/RescheduleBookingModal";

import {
    getPendingBookings,
    getConfirmedBookings,
    getCanceledBookings,
    confirmBooking,
    rescheduleBooking,
    cancelBooking,
    type DashboardBooking,
} from "../lib/api/booking";
import { logout } from "../lib/api/auth";
import { formatSAPhone } from "../lib/validation";

type Stage = "New" | "Contacted" | "Won" | "Lost";

interface Lead {
    id: string;
    name: string;
    service: string;
    value: number;
    stage: Stage;
    phone: string;
    lastContact: string;
}

type View = "overview" | "deliver" | "website";

const NAV: { id: View; label: string }[] = [
    { id: "overview", label: "Overview" },
    // { id: "deliver", label: "Send photos" },
    { id: "website", label: "Website Edit" },
];

const OWNER = "Aneesa";

const STAGES: Stage[] = ["New", "Contacted", "Won", "Lost"];

const STAGE_BAR: Record<Stage, string> = {
    New: "#E7E1D6",
    Contacted: "#D8CFC0",
    Won: "#171717",
    Lost: "#F3EEE6",
};

const STAGE_PILL: Record<Stage, string> = {
    New: "border-neutral-300 bg-white text-neutral-700",
    Contacted: "border-transparent bg-[#E7E1D6] text-neutral-800",
    Won: "border-transparent bg-neutral-900 text-white",
    Lost: "border-neutral-300 bg-transparent text-neutral-400",
};

const rand = (n: number) => `R ${n.toLocaleString("en-ZA")}`;

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-5 flex items-center justify-center gap-4">
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
                Previous
            </button>

            <span className="text-sm text-neutral-500">
                {page} / {totalPages}
            </span>

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
                Next
            </button>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [pendingBookings, setPendingBookings] = useState<DashboardBooking[]>([]);
    const [confirmedBookings, setConfirmedBookings] = useState<DashboardBooking[]>([]);
    const [canceledBookings, setCanceledBookings] = useState<DashboardBooking[]>([]);

    const leads = useMemo(() => {
        const newLeads: Lead[] = pendingBookings.map((booking) => ({
            id: booking.ref,
            name: booking.name,
            service: booking.package.name,
            value: booking.package.price,
            stage: "New",
            phone: booking.phone,
            lastContact: "Pending booking",
        }));

        const contactedPending: Lead[] = pendingBookings.map((booking) => ({
            id: `${booking.ref}-contacted`,
            name: booking.name,
            service: booking.package.name,
            value: booking.package.price,
            stage: "Contacted",
            phone: booking.phone,
            lastContact: "Pending booking",
        }));

        const wonLeads: Lead[] = confirmedBookings.map((booking) => ({
            id: booking.ref,
            name: booking.name,
            service: booking.package.name,
            value: booking.package.price,
            stage: "Won",
            phone: booking.phone,
            lastContact: "Confirmed booking",
        }));

        const contactedConfirmed: Lead[] = confirmedBookings.map((booking) => ({
            id: `${booking.ref}-contacted`,
            name: booking.name,
            service: booking.package.name,
            value: booking.package.price,
            stage: "Contacted",
            phone: booking.phone,
            lastContact: "Confirmed booking",
        }));

        const lostLeads: Lead[] = canceledBookings.map((booking) => ({
            id: booking.ref,
            name: booking.name,
            service: booking.package.name,
            value: booking.package.price,
            stage: "Lost",
            phone: booking.phone,
            lastContact: "Canceled booking",
        }));

        return [
            ...newLeads,
            ...contactedPending,
            ...wonLeads,
            ...contactedConfirmed,
            ...lostLeads,
        ];
    }, [pendingBookings, confirmedBookings, canceledBookings]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [filter, setFilter] = useState<Stage | "All">("All");
    const [query, setQuery] = useState("");
    const [adding, setAdding] = useState(false);
    const [view, setView] = useState<View>("overview");
    const [draft, setDraft] = useState({ name: "", service: "", value: "" });

    const [cancelModal, setCancelModal] = useState<DashboardBooking | null>(null);
    const [cancelReason, setCancelReason] = useState<CancelReason | "">("");
    const [customReason, setCustomReason] = useState("");

    const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);
    const [expandedConfirmed, setExpandedConfirmed] = useState<string | null>(null);

    const [rescheduleModal, setRescheduleModal] = useState<DashboardBooking | null>(null);
    const [confirmModal, setConfirmModal] = useState<DashboardBooking | null>(null);
    const [refQuery, setRefQuery] = useState("");

    const [pendingPage, setPendingPage] = useState(1);
    const [confirmedPage, setConfirmedPage] = useState(1);
    const [leadsPage, setLeadsPage] = useState(1);

    const BOOKINGS_PER_PAGE = 5;
    const LEADS_PER_PAGE = 8;

    const counts = useMemo(
        () => STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length })),
        [leads]
    );

    const openLeads = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;

    const wonValue = leads
        .filter((l) => l.stage === "Won")
        .reduce((sum, l) => sum + l.value, 0);

    const pendingValue = pendingBookings.reduce(
        (sum, booking) => sum + booking.package.price,
        0
    );

    const visible = leads.filter(
        (l) =>
            (filter === "All" || l.stage === filter) &&
            `${l.name} ${l.service}`.toLowerCase().includes(query.toLowerCase())
    );

    const leadsTotalPages = Math.max(1, Math.ceil(visible.length / LEADS_PER_PAGE));

    const currentLeadsPage = Math.min(leadsPage, leadsTotalPages);

    const paginatedLeads = visible.slice(
        (currentLeadsPage - 1) * LEADS_PER_PAGE,
        currentLeadsPage * LEADS_PER_PAGE
    );

    const filteredBookings = pendingBookings.filter((booking) =>
        booking.ref.toLowerCase().includes(refQuery.trim().toLowerCase())
    );

    const pendingTotalPages = Math.max(
        1,
        Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE)
    );

    const paginatedPendingBookings = filteredBookings.slice(
        (pendingPage - 1) * BOOKINGS_PER_PAGE,
        pendingPage * BOOKINGS_PER_PAGE
    );

    const confirmedTotalPages = Math.max(
        1,
        Math.ceil(confirmedBookings.length / BOOKINGS_PER_PAGE)
    );

    const paginatedConfirmedBookings = confirmedBookings.slice(
        (confirmedPage - 1) * BOOKINGS_PER_PAGE,
        confirmedPage * BOOKINGS_PER_PAGE
    );

    const addLead = () => {
        setAdding(false);
    };

    useEffect(() => {
        const loadBookings = async () => {
            try {
                const [pending, confirmed, canceled] = await Promise.all([
                    getPendingBookings(),
                    getConfirmedBookings(),
                    getCanceledBookings(),
                ]);

                setPendingBookings(pending);
                setConfirmedBookings(confirmed);
                setCanceledBookings(canceled);
            } catch (error) {
                console.error("Failed to load bookings:", error);
            } finally {
                setLoadingBookings(false);
            }
        };

        loadBookings();
    }, []);

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-[#F3EEE6] font-sans text-neutral-900">
                <header className="flex items-center justify-between gap-3 border-b border-[#D8CFC0] bg-white px-4 py-4 sm:px-10 sm:py-5">
                    <span className="whitespace-nowrap text-xl font-light tracking-wide sm:text-2xl" style={serif}>
                        AD Photography
                    </span>
                    <nav className="hidden gap-10 sm:flex" aria-label="Dashboard sections">
                        {NAV.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => setView(n.id)}
                                aria-current={view === n.id ? "page" : undefined}
                                className={`border-b pb-1 text-[13px] font-medium uppercase tracking-[0.2em] transition ${view === n.id
                                    ? "border-neutral-900 opacity-100"
                                    : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                            >
                                {n.label}
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link
                            to="/"
                            className="hidden text-[13px] font-medium uppercase tracking-[0.2em] opacity-80 transition hover:opacity-100 sm:block"
                        >
                            View site
                        </Link>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await logout();
                                    navigate("/login");
                                } catch (error) {
                                    console.error("Logout failed:", error);
                                }
                            }}
                            className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.15em] opacity-60 transition hover:opacity-100 sm:text-[13px] sm:tracking-[0.2em]"
                        >
                            Log out
                        </button>
                        <button
                            onClick={() => {
                                setView("overview");
                                setAdding((a) => !a);
                            }}
                            aria-label={adding ? "Cancel" : "Add lead"}
                            className="inline-flex items-center gap-2 whitespace-nowrap border border-neutral-900 px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.25em] transition hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:px-5"
                        >
                            {adding ? <X size={14} /> : <Plus size={14} />}
                            <span className="hidden sm:inline">{adding ? "Cancel" : "Add lead"}</span>
                        </button>
                    </div>
                </header>

                <nav className="flex gap-2 overflow-x-auto border-b border-[#D8CFC0] bg-white px-6 py-3 sm:hidden" aria-label="Dashboard sections">
                    {NAV.map((n) => (
                        <button
                            key={n.id}
                            onClick={() => setView(n.id)}
                            aria-current={view === n.id ? "page" : undefined}
                            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${view === n.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600"
                                }`}
                        >
                            {n.label}
                        </button>
                    ))}
                </nav>

                {view === "deliver" && <DeliverPhotos clients={leads} />}
                {view === "website" && <WebsiteImages />}

                <main className={`mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14 ${view === "overview" ? "" : "hidden"}`}>
                    {/* Greeting */}
                    <h1 className="text-4xl font-light tracking-wide sm:text-6xl" style={serif}>
                        {greeting()}, {OWNER}
                    </h1>
                    <p className="mt-3 max-w-xl text-neutral-600">
                        {loadingBookings
                            ? "Loading your bookings..."
                            : pendingBookings.length === 0
                                ? "You are all caught up. No pending bookings."
                                : `${pendingBookings.length} ${pendingBookings.length === 1 ? "booking is" : "bookings are"} waiting for your attention.`}
                    </p>

                    <AnimatePresence initial={false}>
                        {adding && (
                            <motion.form
                                onSubmit={addLead}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="mt-8 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-[1.2fr_1.2fr_0.7fr_auto]">
                                    <input
                                        value={draft.name}
                                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                        placeholder="Name"
                                        aria-label="Name"
                                        className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                                    />
                                    <input
                                        value={draft.service}
                                        onChange={(e) => setDraft({ ...draft, service: e.target.value })}
                                        placeholder="What do they need?"
                                        aria-label="Service"
                                        className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                                    />
                                    <input
                                        value={draft.value}
                                        onChange={(e) => setDraft({ ...draft, value: e.target.value.replace(/\D/g, "") })}
                                        placeholder="Value in Rand"
                                        inputMode="numeric"
                                        aria-label="Value in Rand"
                                        className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm text-white transition hover:bg-neutral-700"
                                    >
                                        Save lead
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <dl className="mt-10 grid grid-cols-1 divide-y divide-[#D8CFC0] border-y border-[#D8CFC0] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {[
                            { label: "Open leads", value: String(openLeads) },
                            { label: "Quotes waiting", value: rand(pendingValue) },
                            { label: "Won this month", value: rand(wonValue) },
                        ].map((s) => (
                            <div key={s.label} className="px-0 py-6 sm:px-8 sm:first:pl-0">
                                <dt className="text-sm text-neutral-500">{s.label}</dt>
                                <dd className="mt-1 text-4xl font-light" style={serif}>
                                    {s.value}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <section className="mt-14" aria-labelledby="followups-title">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <h2
                                id="followups-title"
                                className="text-3xl font-light tracking-wide sm:text-4xl"
                                style={serif}
                            >
                                Pending Requests
                            </h2>

                            <label className="relative block sm:w-64">
                                <Search
                                    size={15}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                                />
                                <input
                                    value={refQuery}
                                    onChange={(e) => {
                                        setRefQuery(e.target.value);
                                        setPendingPage(1);
                                    }}
                                    placeholder="Search by reference"
                                    aria-label="Search bookings by reference"
                                    className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm uppercase outline-none placeholder:normal-case focus:border-neutral-900"
                                />
                            </label>
                        </div>

                        <ul className="mt-6 flex flex-col gap-3">
                            <AnimatePresence initial={false}>
                                {loadingBookings ? (
                                    <motion.li
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-xl bg-white p-5 text-sm text-neutral-500"
                                    >
                                        Loading pending bookings...
                                    </motion.li>
                                ) : pendingBookings.length === 0 ? (
                                    <motion.li
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-xl bg-white p-8 text-center text-sm text-neutral-500"
                                    >
                                        No pending bookings.
                                    </motion.li>
                                ) : filteredBookings.length === 0 ? (
                                    <motion.li
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-xl bg-white p-8 text-center text-sm text-neutral-500"
                                    >
                                        No pending booking matches "{refQuery.trim()}".
                                    </motion.li>
                                ) : (
                                    paginatedPendingBookings.map((booking) => (
                                        <motion.li
                                            key={booking.ref}
                                            layout
                                            exit={{ opacity: 0, x: 40 }}
                                            transition={{
                                                duration: 0.35,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                            className="overflow-hidden rounded-xl bg-white"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedFollowUp(
                                                        expandedFollowUp === booking.ref ? null : booking.ref
                                                    )
                                                }
                                                className="w-full p-4 text-left sm:p-5"
                                            >
                                                <div className="flex items-center justify-between gap-3 sm:gap-4">
                                                    <div className="flex min-w-0 flex-1 items-baseline gap-3 sm:gap-5">
                                                        <span className="w-12 shrink-0 text-sm text-neutral-500 sm:w-20">
                                                            {new Date(booking.date + "T00:00:00").toLocaleDateString("en-ZA", {
                                                                day: "numeric",
                                                                month: "short",
                                                            })}
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">{booking.name}</p>

                                                            <p className="truncate text-sm text-neutral-600">
                                                                {booking.package.name} · {rand(booking.package.price)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <motion.span
                                                        animate={{ rotate: expandedFollowUp === booking.ref ? 180 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="shrink-0 text-neutral-400"
                                                    >
                                                        ↓
                                                    </motion.span>
                                                </div>
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {expandedFollowUp === booking.ref && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{
                                                            duration: 0.3,
                                                            ease: [0.16, 1, 0.3, 1],
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-[#E7E1D6] px-5 pb-5 pt-5">
                                                            <div className="grid gap-4 sm:grid-cols-2">
                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Booking reference
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.ref}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Package
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.package.name} —{" "}
                                                                        {rand(booking.package.price)}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Email
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.email}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Phone
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {formatSAPhone(booking.phone)}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Booking date
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
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

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Selected times
                                                                    </p>

                                                                    <p className="mt-1 text-sm">
                                                                        {booking.times.length > 0
                                                                            ? booking.times.join(", ")
                                                                            : "No times selected."}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Notes
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.notes ||
                                                                            "No notes provided."}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div
                                                                className="mt-5 flex flex-wrap gap-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <a
                                                                    href={`https://wa.me/${booking.phone}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:border-neutral-900"
                                                                >
                                                                    <MessageCircle size={15} />
                                                                    WhatsApp
                                                                </a>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setConfirmModal(booking)
                                                                    }
                                                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700"
                                                                >
                                                                    <Check size={15} />
                                                                    Confirm
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCancelModal(booking);
                                                                        setCancelReason("");
                                                                        setCustomReason("");
                                                                    }}
                                                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                                                                >
                                                                    <X size={15} />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.li>
                                    ))
                                )}
                            </AnimatePresence>
                        </ul>
                        <Pagination
                            page={pendingPage}
                            totalPages={pendingTotalPages}
                            onPageChange={setPendingPage}
                        />
                    </section>

                    <section className="mt-20" aria-labelledby="confirmed-title">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <h2
                                id="confirmed-title"
                                className="text-3xl font-light tracking-wide sm:text-4xl"
                                style={serif}
                            >
                                Confirmed Bookings
                            </h2>
                        </div>

                        <ul className="mt-6 flex flex-col gap-3">
                            <AnimatePresence initial={false}>
                                {confirmedBookings.length === 0 ? (
                                    <motion.li
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-xl bg-white p-8 text-center text-sm text-neutral-500"
                                    >
                                        No confirmed bookings yet.
                                    </motion.li>
                                ) : (
                                    paginatedConfirmedBookings.map((booking) => (
                                        <motion.li
                                            key={booking.ref}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="overflow-hidden rounded-xl bg-white"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedConfirmed(
                                                        expandedConfirmed === booking.ref ? null : booking.ref
                                                    )
                                                }
                                                className="w-full p-4 text-left sm:p-5"
                                            >
                                                <div className="flex items-center justify-between gap-3 sm:gap-4">
                                                    <div className="flex min-w-0 flex-1 items-baseline gap-3 sm:gap-5">
                                                        <span className="w-12 shrink-0 text-sm text-neutral-500 sm:w-20">
                                                            {new Date(booking.date + "T00:00:00").toLocaleDateString("en-ZA", {
                                                                day: "numeric",
                                                                month: "short",
                                                            })}
                                                        </span>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">{booking.name}</p>

                                                            <p className="truncate text-sm text-neutral-600">
                                                                {booking.package.name} · {rand(booking.package.price)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                                                        <span className="hidden text-xs font-medium uppercase tracking-[0.12em] text-green-600 sm:inline">
                                                            Confirmed
                                                        </span>
                                                        <span
                                                            role="img"
                                                            aria-label="Confirmed"
                                                            className="h-2 w-2 rounded-full bg-green-600 sm:hidden"
                                                        />

                                                        <motion.span
                                                            animate={{ rotate: expandedConfirmed === booking.ref ? 180 : 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="text-neutral-400"
                                                        >
                                                            ↓
                                                        </motion.span>
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {expandedConfirmed === booking.ref && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{
                                                            duration: 0.3,
                                                            ease: [0.16, 1, 0.3, 1],
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-[#E7E1D6] px-5 pb-5 pt-5">
                                                            <div className="grid gap-4 sm:grid-cols-2">
                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Booking reference
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.ref}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Package
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.package.name} —{" "}
                                                                        {rand(booking.package.price)}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Email
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.email}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Phone
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {formatSAPhone(booking.phone)}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Booking date
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
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

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Selected times
                                                                    </p>

                                                                    <p className="mt-1 text-sm">
                                                                        {booking.times.length > 0
                                                                            ? booking.times.join(", ")
                                                                            : "No times selected."}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                        Notes
                                                                    </p>
                                                                    <p className="mt-1 text-sm">
                                                                        {booking.notes ||
                                                                            "No notes provided."}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div
                                                                className="mt-5 flex flex-wrap gap-2"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <a
                                                                    href={`https://wa.me/${booking.phone}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:border-neutral-900"
                                                                >
                                                                    <MessageCircle size={15} />
                                                                    WhatsApp
                                                                </a>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setRescheduleModal(booking);
                                                                    }}
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:border-neutral-900"
                                                                >
                                                                    <Calendar size={15} />
                                                                    Reschedule
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCancelModal(booking);
                                                                        setCancelReason("");
                                                                        setCustomReason("");
                                                                    }}
                                                                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                                                                >
                                                                    <X size={15} />
                                                                    Cancel booking
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.li>
                                    ))
                                )}
                            </AnimatePresence>
                        </ul>
                        <Pagination
                            page={confirmedPage}
                            totalPages={confirmedTotalPages}
                            onPageChange={setConfirmedPage}
                        />
                    </section>

                    {/* Pipeline */}
                    <section className="mt-14" aria-labelledby="pipeline-title">
                        <h2 id="pipeline-title" className="text-3xl font-light tracking-wide sm:text-4xl" style={serif}>
                            Overview
                        </h2>

                        <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-[#E7E1D6]" role="img" aria-label="Leads by stage">
                            {counts.map(({ stage, count }) =>
                                count > 0 ? (
                                    <motion.div
                                        key={stage}
                                        layout
                                        style={{ flexGrow: count, backgroundColor: STAGE_BAR[stage] }}
                                        className="h-full border-r border-[#F3EEE6] last:border-r-0"
                                    />
                                ) : null
                            )}
                        </div>

                        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm text-neutral-600">
                            {counts.map(({ stage, count }) => (
                                <li key={stage} className="flex items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full border border-neutral-300"
                                        style={{ backgroundColor: STAGE_BAR[stage] }}
                                    />
                                    {stage} <span className="text-neutral-900">{count}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Leads table */}
                    <section className="mt-14" aria-labelledby="leads-title">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <h2 id="leads-title" className="text-3xl font-light tracking-wide sm:text-4xl" style={serif}>
                                Leads and clients
                            </h2>
                            <label className="relative block sm:w-64">
                                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name or service"
                                    aria-label="Search leads"
                                    className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {(["All", ...STAGES] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    aria-pressed={filter === s}
                                    className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === s
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 overflow-hidden rounded-xl bg-white">
                            {visible.length === 0 ? (
                                <p className="px-6 py-12 text-center text-sm text-neutral-500">
                                    No leads match. Clear the search or add a new lead.
                                </p>
                            ) : (
                                <ul className="divide-y divide-[#E7E1D6]">
                                    {paginatedLeads.map((l) => (
                                        <li
                                            key={l.id}
                                            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 sm:grid-cols-[1.4fr_1.4fr_auto_7rem_8rem] sm:gap-y-0"
                                        >
                                            <p className="font-medium">{l.name}</p>
                                            <p className="order-3 col-span-2 text-sm text-neutral-600 sm:order-none sm:col-span-1">
                                                {l.service}
                                            </p>
                                            <span
                                                className={`justify-self-end rounded-full border px-3 py-1 text-xs sm:justify-self-start ${STAGE_PILL[l.stage]}`}
                                            >
                                                {l.stage}
                                            </span>
                                            <p className="hidden text-right text-sm sm:block">{l.value ? rand(l.value) : "No value yet"}</p>
                                            <p className="hidden text-right text-sm text-neutral-500 sm:block">{l.lastContact}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Pagination
                            page={currentLeadsPage}
                            totalPages={leadsTotalPages}
                            onPageChange={setLeadsPage}
                        />
                    </section>
                </main>
                <CancelBookingModal
                    booking={cancelModal}
                    reason={cancelReason}
                    setReason={setCancelReason}
                    customReason={customReason}
                    setCustomReason={setCustomReason}
                    onClose={() => {
                        setCancelModal(null);
                        setCancelReason("");
                        setCustomReason("");
                    }}
                    onCancel={async () => {
                        if (!cancelModal || !cancelReason) return;

                        const finalReason =
                            cancelReason === "Other" ? customReason.trim() : cancelReason;

                        if (!finalReason) return;

                        try {
                            await cancelBooking(cancelModal.ref, finalReason);

                            setPendingBookings((prev) =>
                                prev.filter((booking) => booking.ref !== cancelModal.ref)
                            );

                            setConfirmedBookings((prev) =>
                                prev.filter((booking) => booking.ref !== cancelModal.ref)
                            );

                            setCanceledBookings((prev) => [
                                { ...cancelModal, status: "canceled" },
                                ...prev,
                            ]);

                            setCancelModal(null);
                            setCancelReason("");
                            setCustomReason("");
                        } catch (error) {
                            console.error("Failed to cancel booking:", error);
                        }
                    }}
                />
                <ConfirmBookingModal
                    booking={confirmModal}
                    onClose={() => setConfirmModal(null)}
                    onConfirm={async () => {
                        if (!confirmModal) return;

                        try {
                            const result = await confirmBooking(confirmModal.ref);

                            setConfirmedBookings((prev) => [
                                result.data,
                                ...prev,
                            ]);

                            setPendingBookings((prev) =>
                                prev.filter(
                                    (booking) => booking.ref !== confirmModal.ref
                                )
                            );

                            setConfirmModal(null);
                        } catch (error) {
                            console.error("Failed to confirm booking:", error);
                        }
                    }}
                />
                <RescheduleBookingModal
                    booking={rescheduleModal}
                    onClose={() => setRescheduleModal(null)}
                    onReschedule={async (date, times) => {
                        if (!rescheduleModal) return;

                        const result = await rescheduleBooking(
                            rescheduleModal.ref,
                            date,
                            times
                        );

                        setConfirmedBookings((prev) =>
                            prev.map((booking) =>
                                booking.ref === rescheduleModal.ref
                                    ? result.data
                                    : booking
                            )
                        );

                        setRescheduleModal(null);
                    }}
                />
            </div>
        </MotionConfig>
    );
}