import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login } from "../lib/api/auth";

const inputClass =
    "w-full rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900";

const labelClass =
    "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-neutral-500";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = !!email.trim() && !!password;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!canSubmit || loading) return;

        setLoading(true);
        setError("");

        try {
            const result = await login(
                email.trim(),
                password
            );

            if (result.data.role !== "owner") {
                setError(
                    "You do not have access to this dashboard."
                );
                return;
            }

            navigate("/admin");
        } catch (error) {
            console.error("Login failed:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="fixed inset-y-0 left-0 hidden w-1/3 lg:block">
                <img
                    src="./images/DSC_0539 2.webp"
                    alt="Bride laughing in golden light"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="lg:ml-[33.333%]">
                <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-28 sm:py-32 lg:px-16">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-900"
                        >
                            ← Back to Home
                        </Link>
                    </div>

                    <h1
                        className="mt-4 text-5xl text-neutral-900"
                        style={{
                            fontFamily:
                                "'Cormorant Garamond', serif",
                        }}
                    >
                        Welcome back
                    </h1>

                    <p className="mt-3 max-w-md text-sm text-neutral-500">
                        Sign in to manage your bookings and
                        clients.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-12 max-w-md space-y-5"
                    >
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className={labelClass}
                            >
                                Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@email.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className={`${inputClass} pl-11 pr-11`}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className={labelClass}
                            >
                                Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                                />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className={`${inputClass} pl-11 pr-11`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-900"
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={
                                !canSubmit || loading
                            }
                            className="mt-4 flex w-full items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}