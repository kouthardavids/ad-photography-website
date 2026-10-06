import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, ImagePlus, MessageCircle, X } from "lucide-react";

interface Client {
    id: string;
    name: string;
    phone: string;
    stage: string;
}

interface Picked {
    id: string;
    url: string;
}

const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;
const GALLERY_BASE = "https://adphotography.co.za/gallery";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function DeliverPhotos({ clients }: { clients: Client[] }) {
    // Won clients first, they are the ones waiting for photos
    const options = useMemo(
        () => clients.filter((client) => client.stage === "Won"),
        [clients]
    );
    const [clientId, setClientId] = useState(options[0]?.id ?? "");
    const [photos, setPhotos] = useState<Picked[]>([]);
    const [note, setNote] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dragging, setDragging] = useState(false);
    const urlsRef = useRef<string[]>([]);

    const client = options.find((c) => c.id === clientId);
    const link = client ? `${GALLERY_BASE}/${slugify(client.name)}` : "";
    const firstName = client?.name.split(/[ &]/)[0] ?? "";
    const message = note ?? `Hi ${firstName}, your photos are ready. You can view and download them here:`;

    useEffect(() => {
        const urls = urlsRef.current;
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, []);

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const added = Array.from(files)
            .filter((f) => f.type.startsWith("image/"))
            .map((f) => {
                const url = URL.createObjectURL(f);
                urlsRef.current.push(url);
                return { id: crypto.randomUUID(), url };
            });
        setPhotos((p) => [...p, ...added]);
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const pickClient = (id: string) => {
        setClientId(id);
        setNote(null);
    };

    const canSend = !!client?.phone && photos.length > 0;

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
            <h1 className="text-4xl font-light tracking-wide sm:text-6xl" style={serif}>
                Send photos
            </h1>
            <p className="mt-3 max-w-xl text-neutral-600">
                Choose a client, add their photos, and send them a private gallery link on WhatsApp.
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-[18rem_1fr]">
                {/* Client list */}
                <section aria-labelledby="client-title">
                    <h2 id="client-title" className="text-2xl font-light tracking-wide" style={serif}>
                        Client
                    </h2>
                    <ul className="mt-4 flex max-h-80 flex-col gap-2 overflow-y-auto">
                        {options.map((c) => (
                            <li key={c.id}>
                                <button
                                    onClick={() => pickClient(c.id)}
                                    aria-pressed={c.id === clientId}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${c.id === clientId
                                        ? "bg-neutral-900 text-white"
                                        : "bg-white hover:bg-[#E7E1D6]"
                                        }`}
                                >
                                    <span className="font-medium">{c.name}</span>
                                    <span className={c.id === clientId ? "text-white/70" : "text-neutral-500"}>{c.stage}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Photos and message */}
                <section aria-labelledby="photos-title">
                    <h2 id="photos-title" className="text-2xl font-light tracking-wide" style={serif}>
                        Photos for {client?.name ?? "..."}
                    </h2>

                    <label
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            addFiles(e.dataTransfer.files);
                        }}
                        className={`mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center text-sm transition ${dragging ? "border-neutral-900 bg-white" : "border-[#B9AE9B] bg-white/60 hover:bg-white"
                            }`}
                    >
                        <ImagePlus size={22} className="text-neutral-500" />
                        <span>Drop photos here or click to choose</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(e) => {
                                addFiles(e.target.files);
                                e.target.value = "";
                            }}
                        />
                    </label>

                    {photos.length > 0 && (
                        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {photos.map((p) => (
                                <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg bg-[#E7E1D6]">
                                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                                    <button
                                        onClick={() => setPhotos((all) => all.filter((x) => x.id !== p.id))}
                                        aria-label="Remove photo"
                                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                                    >
                                        <X size={13} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <label className="mt-8 block text-sm text-neutral-600" htmlFor="msg">
                        Message
                    </label>
                    <textarea
                        id="msg"
                        value={message}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm">
                        <span className="truncate text-neutral-600">{link}</span>
                        <button
                            onClick={copyLink}
                            className="inline-flex shrink-0 items-center gap-2 text-neutral-900 hover:opacity-70"
                        >
                            <Copy size={14} />
                            {copied ? "Copied" : "Copy link"}
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <a
                            href={canSend ? `https://wa.me/${client!.phone}?text=${encodeURIComponent(`${message}\n${link}`)}` : undefined}
                            target="_blank"
                            rel="noreferrer"
                            aria-disabled={!canSend}
                            className={`inline-flex items-center gap-2 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.25em] transition ${canSend
                                ? "bg-neutral-900 text-white hover:bg-neutral-700"
                                : "pointer-events-none bg-neutral-300 text-neutral-500"
                                }`}
                        >
                            <MessageCircle size={14} />
                            Send on WhatsApp
                        </a>
                        {!canSend && (
                            <p className="text-sm text-neutral-500">
                                {!client?.phone ? "This client has no phone number saved." : "Add at least one photo to send."}
                            </p>
                        )}
                    </div>

                    <p className="mt-8 max-w-xl text-xs leading-relaxed text-neutral-500">
                        Photos shown here only exist in your browser. Before the link works for the client, the files
                        need to be uploaded to storage and the gallery page needs to read them from there.
                    </p>
                </section>
            </div>
        </main>
    );
}