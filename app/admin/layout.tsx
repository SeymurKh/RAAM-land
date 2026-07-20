"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/artists", label: "Artists" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/stream", label: "Stream" },
  ];

  return (
    <nav className="flex items-center gap-6 border-b border-white/10 bg-black/40 px-6 py-4">
      <span className="text-sm font-semibold uppercase tracking-[0.24em] text-white">
        RAAM Admin
      </span>
      <div className="flex gap-4">
        {links.map((link) => (
          <button
            key={link.href}
            type="button"
            onClick={() => router.push(link.href)}
            className={`text-xs uppercase tracking-[0.2em] transition ${
              pathname === link.href
                ? "text-white"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={async () => {
          await fetch("/api/auth", { method: "DELETE" });
          window.location.href = "/admin";
        }}
        className="ml-auto text-xs uppercase tracking-[0.2em] text-stone-500 transition hover:text-stone-300"
      >
        Logout
      </button>
    </nav>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth").then((res) => {
      setAuthed(res.ok);
      setLoading(false);
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setError("Invalid password");
      setPassword("");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080706] text-stone-400">
        Loading...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080706]">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-[#0b0a09] p-8"
        >
          <h1 className="text-xl font-semibold uppercase tracking-[0.16em] text-white">
            RAAM Admin
          </h1>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="h-12 w-full rounded-full border border-white/15 bg-white/6 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080706] text-stone-100">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
