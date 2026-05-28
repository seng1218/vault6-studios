"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, Loader2 } from "lucide-react";
import { registerMember } from "@/app/actions/member-actions";

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (document.cookie.includes("v6_member_session")) router.replace("/member");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await registerMember(form);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push("/member"), 1200);
    } else {
      setError(res.error ?? "Registration failed.");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center pt-48 pb-32 px-6">
        <div className="max-w-xl w-full">
          <div className="bg-foreground/[0.02] border border-foreground/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-v6-accent/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">JOIN US</h1>
                <p className="opacity-60 text-sm">Create an account for early access, exclusive discounts, and order tracking.</p>
              </div>

              {success ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-v6-accent/20 text-v6-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase">CLEARANCE GRANTED</h3>
                  <p className="opacity-60 text-sm">Redirecting to your vault...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-3 text-red-400 text-xs font-black uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                      <p className="text-[9px] opacity-30 uppercase tracking-widest ml-4 mt-1">Minimum 6 characters</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-v6-accent text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-xs opacity-40 font-medium">
                  Already have an account?{" "}
                  <Link href="/login" className="text-v6-accent hover:text-foreground font-black transition-colors">Login here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
