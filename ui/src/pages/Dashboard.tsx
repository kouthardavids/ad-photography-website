import { useMemo, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, MessageCircle, Plus, Search, X } from "lucide-react";
import DeliverPhotos from "./DeliverPhotos";
import WebsiteImages from "./WebsiteImages";

import CancelBookingModal from "../components/CancelBookingModal";
import type { CancelReason } from "../components/CancelBookingModal";
import ConfirmBookingModal from "../components/ConfirmBookingModal";

type Stage = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

interface Lead {
    id: string;
    name: string;
    service: string;
    value: number;
    stage: Stage;
    phone: string;
    lastContact: string;
}

interface FollowUp {
    id: string;
    name: string;
    note: string;
    due: string;
    phone: string;
    email: string;
}

type View = "overview" | "deliver" | "website";

const NAV: { id: View; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "deliver", label: "Send photos" },
    { id: "website", label: "Website Edit" },
];

const OWNER = "Aneesa";

const STAGES: Stage[] = ["New", "Contacted", "Quoted", "Won", "Lost"];

const STAGE_BAR: Record<Stage, string> = {
    New: "#E7E1D6",
    Contacted: "#D8CFC0",
    Quoted: "#B9AE9B",
    Won: "#171717",
    Lost: "#F3EEE6",
};

const STAGE_PILL: Record<Stage, string> = {
    New: "border-neutral-300 bg-white text-neutral-700",
    Contacted: "border-transparent bg-[#E7E1D6] text-neutral-800",
    Quoted: "border-transparent bg-[#D8CFC0] text-neutral-900",
    Won: "border-transparent bg-neutral-900 text-white",
    Lost: "border-neutral-300 bg-transparent text-neutral-400",
};

const INITIAL_LEADS: Lead[] = [
    { id: "l1", name: "Kyle & Reece", service: "Wedding, Stellenbosch", value: 14500, stage: "Quoted", phone: "27821110001", lastContact: "2 days ago" },
    { id: "l2", name: "Nadia Petersen", service: "Family session", value: 1800, stage: "Contacted", phone: "27821110002", lastContact: "Yesterday" },
    { id: "l3", name: "Werner & Lise", service: "Wedding, Paarl", value: 16000, stage: "Won", phone: "27821110003", lastContact: "Last week" },
    { id: "l4", name: "Amy Joubert", service: "Portrait session", value: 1200, stage: "New", phone: "27821110004", lastContact: "Today" },
    { id: "l5", name: "Shanon Gordon", service: "Engagement shoot", value: 2400, stage: "Quoted", phone: "27821110005", lastContact: "3 days ago" },
    { id: "l6", name: "Lindiwe Mokoena", service: "Family session", value: 2100, stage: "Won", phone: "27821110006", lastContact: "Last week" },
    { id: "l7", name: "Chris & Wian", service: "Wedding, Hermanus", value: 13000, stage: "Lost", phone: "27821110007", lastContact: "2 weeks ago" },
    { id: "l8", name: "Nash Daniels", service: "Birthday event", value: 1500, stage: "New", phone: "27821110008", lastContact: "Today" },
];

const INITIAL_FOLLOW_UPS: FollowUp[] = [
    {
        id: "f1",
        name: "Kyle & Reece",
        note: "Quote sent 2 days ago, no reply yet",
        due: "9:30 AM",
        phone: "27821110001",
        email: "kyle@example.com",
    },
    {
        id: "f2",
        name: "Shanon Gordon",
        note: "Asked about a second location",
        due: "11:00 AM",
        phone: "27821110005",
        email: "shanon@example.com",
    },
    {
        id: "f3",
        name: "Amy Joubert",
        note: "New enquiry, send package details",
        due: "2:00 PM",
        phone: "27821110004",
        email: "amy@example.com",
    },
];

const rand = (n: number) => `R ${n.toLocaleString("en-ZA")}`;

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

export default function Dashboard() {
    const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
    const [followUps, setFollowUps] = useState<FollowUp[]>(INITIAL_FOLLOW_UPS);
    const [filter, setFilter] = useState<Stage | "All">("All");
    const [query, setQuery] = useState("");
    const [adding, setAdding] = useState(false);
    const [view, setView] = useState<View>("overview");
    const [draft, setDraft] = useState({ name: "", service: "", value: "" });

    const [cancelModal, setCancelModal] = useState<FollowUp | null>(null);
    const [cancelReason, setCancelReason] = useState<CancelReason | "">("");

    const [expandedFollowUp, setExpandedFollowUp] = useState<string | null>(null);

    const [confirmModal, setConfirmModal] = useState<FollowUp | null>(null);

    const counts = useMemo(
        () => STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length })),
        [leads]
    );

    const openLeads = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
    const quotedValue = leads.filter((l) => l.stage === "Quoted").reduce((sum, l) => sum + l.value, 0);
    const wonValue = leads.filter((l) => l.stage === "Won").reduce((sum, l) => sum + l.value, 0);

    const visible = leads.filter(
        (l) =>
            (filter === "All" || l.stage === filter) &&
            `${l.name} ${l.service}`.toLowerCase().includes(query.toLowerCase())
    );

    const addLead = (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft.name.trim()) return;
        setLeads((prev) => [
            {
                id: crypto.randomUUID(),
                name: draft.name.trim(),
                service: draft.service.trim() || "General enquiry",
                value: Number(draft.value) || 0,
                stage: "New",
                phone: "",
                lastContact: "Just now",
            },
            ...prev,
        ]);
        setDraft({ name: "", service: "", value: "" });
        setAdding(false);
    };

    return (
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-[#F3EEE6] font-sans text-neutral-900">
                {/* Header, same treatment as the site nav */}
                <header className="flex items-center justify-between border-b border-[#D8CFC0] bg-white px-6 py-5 sm:px-10">
                    <span className="text-2xl font-light tracking-wide" style={serif}>
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
                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="hidden text-[13px] font-medium uppercase tracking-[0.2em] opacity-80 transition hover:opacity-100 sm:block"
                        >
                            View site
                        </Link>
                        <button
                            onClick={() => {
                                setView("overview");
                                setAdding((a) => !a);
                            }}
                            className="inline-flex items-center gap-2 border border-neutral-900 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.25em] transition hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                        >
                            {adding ? <X size={14} /> : <Plus size={14} />}
                            {adding ? "Cancel" : "Add lead"}
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
                        {followUps.length === 0
                            ? "You are all caught up. No follow-ups left for today."
                            : `${followUps.length} ${followUps.length === 1 ? "person is" : "people are"} waiting to hear from you today.`}
                    </p>

                    {/* Add lead form */}
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

                    {/* Stats, separated by hairlines instead of cards */}
                    <dl className="mt-10 grid grid-cols-1 divide-y divide-[#D8CFC0] border-y border-[#D8CFC0] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        {[
                            { label: "Open leads", value: String(openLeads) },
                            { label: "Quotes waiting", value: rand(quotedValue) },
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

                    {/* Follow-ups: the main job of this page */}
                    <section className="mt-14" aria-labelledby="followups-title">
                        <h2 id="followups-title" className="text-3xl font-light tracking-wide sm:text-4xl" style={serif}>
                            Follow up today
                        </h2>

                        <ul className="mt-6 flex flex-col gap-3">
                            <AnimatePresence initial={false}>
                                {followUps.map((f) => (
                                    <motion.li
                                        key={f.id}
                                        layout
                                        exit={{ opacity: 0, x: 40 }}
                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden rounded-xl bg-white"
                                    >
                                        {/* Main card */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedFollowUp(
                                                    expandedFollowUp === f.id ? null : f.id
                                                )
                                            }
                                            className="w-full p-5 text-left"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-baseline gap-5">
                                                    <span className="w-20 shrink-0 text-sm text-neutral-500">
                                                        {f.due}
                                                    </span>

                                                    <div>
                                                        <p className="font-medium">{f.name}</p>
                                                        <p className="text-sm text-neutral-600">
                                                            {f.note}
                                                        </p>
                                                    </div>
                                                </div>

                                                <motion.span
                                                    animate={{
                                                        rotate: expandedFollowUp === f.id ? 180 : 0,
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-neutral-400"
                                                >
                                                    ↓
                                                </motion.span>
                                            </div>
                                        </button>

                                        {/* Expanded details */}
                                        <AnimatePresence initial={false}>
                                            {expandedFollowUp === f.id && (
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
                                                                    Email
                                                                </p>
                                                                <p className="mt-1 text-sm">
                                                                    {f.email}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                    Phone
                                                                </p>
                                                                <p className="mt-1 text-sm">
                                                                    +{f.phone}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                    Follow-up
                                                                </p>
                                                                <p className="mt-1 text-sm">
                                                                    {f.note}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
                                                                    Due
                                                                </p>
                                                                <p className="mt-1 text-sm">
                                                                    {f.due}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div
                                                            className="mt-5 flex flex-wrap gap-2"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <a
                                                                href={`https://wa.me/${f.phone}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm transition hover:border-neutral-900"
                                                            >
                                                                <MessageCircle size={15} />
                                                                WhatsApp
                                                            </a>

                                                            <button
                                                                type="button"
                                                                onClick={() => setConfirmModal(f)}
                                                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700"
                                                            >
                                                                <Check size={15} />
                                                                Confirm
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCancelModal(f);
                                                                    setCancelReason("");
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
                                ))}
                            </AnimatePresence>
                        </ul>
                    </section>

                    {/* Pipeline */}
                    <section className="mt-14" aria-labelledby="pipeline-title">
                        <h2 id="pipeline-title" className="text-3xl font-light tracking-wide sm:text-4xl" style={serif}>
                            Pipeline
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
                                    {visible.map((l) => (
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
                    </section>
                </main>
                <CancelBookingModal
                    booking={cancelModal}
                    reason={cancelReason}
                    setReason={setCancelReason}
                    onClose={() => {
                        setCancelModal(null);
                        setCancelReason("");
                    }}
                    onCancel={() => {
                        if (!cancelModal || !cancelReason) return;

                        const subject = encodeURIComponent(
                            `Booking Cancellation - ${cancelModal.name}`
                        );

                        const body = encodeURIComponent(
                            `Hi ${cancelModal.name},

                            We regret to inform you that your booking has been cancelled.

                            Reason: ${cancelReason}

                            If you have any questions, please contact us.

                            Kind regards,
                            AD Photography`
                        );

                        // Open the email composer
                        window.location.href =
                            `mailto:${cancelModal.email}?subject=${subject}&body=${body}`;

                        // Remove the booking from follow-ups
                        setFollowUps((prev) =>
                            prev.filter((f) => f.id !== cancelModal.id)
                        );

                        setCancelModal(null);
                        setCancelReason("");
                    }}
                />
                <ConfirmBookingModal
                    booking={confirmModal}
                    onClose={() => setConfirmModal(null)}
                    onConfirm={() => {
                        if (!confirmModal) return;

                        setFollowUps((prev) =>
                            prev.filter((f) => f.id !== confirmModal.id)
                        );

                        setConfirmModal(null);
                    }}
                />
            </div>
        </MotionConfig>
    );
}