import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Package, Truck, Star, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best ToyPanic Alternative in Malaysia for Waifu & Anime Figures",
  description:
    "Looking for a ToyPanic alternative? Vault 6 Studios specialises in waifu and anime figures with free shipping from RM100, hand-inspected stock, and a member loyalty programme.",
  openGraph: {
    title: "Best ToyPanic Alternative for Anime Figures in Malaysia",
    description:
      "Vault 6 is Malaysia's dedicated waifu figure store — free shipping from RM100, curated stock, and a loyalty programme built for collectors.",
  },
};

export default function ToypancAlternative() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <Header />

      <div className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.025]">
        <p className="text-[18vw] font-black leading-[0.7] uppercase tracking-tighter">ALT</p>
        <p className="text-[22vw] font-black leading-[0.7] uppercase text-outline">ERNATIVE</p>
      </div>

      <div className="relative z-10 pt-40 pb-32 px-6 md:px-12 max-w-5xl mx-auto space-y-20">

        {/* ── Hero ── */}
        <div className="space-y-6">
          <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em] block">
            ToyPanic Alternative · Malaysia
          </span>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            The Best<br />ToyPanic<br />Alternative<span className="v6-accent-text">.</span>
          </h1>
          <p className="text-base md:text-lg opacity-60 max-w-xl leading-relaxed font-medium">
            ToyPanic is a big general toy store. If you collect waifu and anime figures specifically, you deserve a store built around exactly that.
          </p>
        </div>

        {/* ── Pain points ── */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            Why People Look for Alternatives<span className="v6-accent-text">.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Free shipping starts at RM200",
                body: "ToyPanic's free shipping threshold is high. If you buy a single figure under RM200, the flat-rate P&P can be a significant chunk of the total cost.",
              },
              {
                title: "Not built for anime figure collectors",
                body: "ToyPanic stocks everything — Hot Toys, die-cast cars, trading cards, video games. If you are looking for waifu and anime figures, you are browsing through a lot of unrelated stock.",
              },
              {
                title: "No wishlist or collector features",
                body: "ToyPanic does not offer a wishlist to track figures you want, or a loyalty programme to reward repeat collectors.",
              },
              {
                title: "Legacy website experience",
                body: "The ToyPanic site runs on ASP.NET and can feel dated, especially on mobile. Some collectors find it harder to discover new figures they would love.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="v6-surface border border-foreground/10 rounded-3xl p-8 space-y-3">
                <h3 className="font-black text-base uppercase tracking-wide">{title}</h3>
                <p className="text-sm opacity-60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── The Alternative ── */}
        <div className="bg-v6-accent/5 border border-v6-accent/20 rounded-3xl p-10 md:p-16 space-y-8">
          <div className="space-y-3">
            <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em] block">The Alternative</span>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
              Vault 6 Studios<span className="v6-accent-text">.</span>
            </h2>
            <p className="opacity-70 text-base leading-relaxed max-w-xl font-medium">
              Malaysia&apos;s dedicated waifu and anime figure store. Every piece in the catalogue is an anime or character figure — no distractions, no filler.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Truck size={20} />, title: "Free Shipping from RM100", body: "Half of ToyPanic's threshold. Most figure orders qualify." },
              { icon: <Shield size={20} />, title: "Hand-Inspected Stock", body: "Every figure checked before it's listed. No damaged boxes." },
              { icon: <Star size={20} />, title: "Loyalty Programme", body: "Earn tier upgrades the more you collect. Real rewards for regulars." },
              { icon: <Package size={20} />, title: "Wishlist & Tracking", body: "Save the figures you want. Track every order in one place." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-background/50 border border-v6-accent/10 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-3 v6-accent-text">
                  {icon}
                  <span className="font-black text-sm uppercase tracking-wide">{title}</span>
                </div>
                <p className="text-xs opacity-50 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature comparison ── */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            Key Differences<span className="v6-accent-text">.</span>
          </h2>
          <div className="overflow-x-auto rounded-3xl border border-foreground/10">
            <table className="w-full text-sm font-medium">
              <thead>
                <tr className="border-b border-foreground/10 v6-surface">
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest opacity-40"></th>
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest v6-accent-text">Vault 6</th>
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest opacity-40">ToyPanic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {[
                  ["Focus",             "Waifu & anime figures",        "All toys, games, kits"],
                  ["Free shipping",     "RM 100+",                      "RM 200+"],
                  ["Stock inspection",  "Every piece checked",          "Brand-level QA"],
                  ["Loyalty programme", "Yes — tiered rewards",         "None publicly"],
                  ["Wishlist",          "Yes",                          "No"],
                  ["Physical store",    "Online only",                  "Penang (2 locations)"],
                ].map(([f, v6, tp]) => (
                  <tr key={f} className="hover:v6-surface transition-colors">
                    <td className="p-5 font-black text-[11px] uppercase tracking-wider opacity-40">{f}</td>
                    <td className="p-5 font-medium">{v6}</td>
                    <td className="p-5 font-medium opacity-50">{tp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Who should switch ── */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            Is Vault 6 Right for You<span className="v6-accent-text">.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="v6-surface border border-v6-accent/20 rounded-3xl p-8 space-y-4">
              <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.4em] block">Switch to Vault 6 if…</span>
              <ul className="space-y-3">
                {[
                  "You mainly buy waifu and anime scale figures",
                  "Your orders are under RM200 and shipping costs sting",
                  "You want to save a wishlist and track what is coming",
                  "You want someone to have checked the figure before it ships",
                  "You want a store built just for this hobby",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                    <span className="opacity-80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="v6-surface border border-foreground/10 rounded-3xl p-8 space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] block opacity-40">Stay with ToyPanic if…</span>
              <ul className="space-y-3">
                {[
                  "You buy across categories — figures, games, kits, TCG",
                  "You are in Penang and want to shop in a physical store",
                  "You collect Hot Toys or Sideshow specifically",
                  "You already have a long purchase history with them",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 size={16} className="text-foreground/25 shrink-0 mt-0.5" />
                    <span className="opacity-40">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Switching is simple ── */}
        <div className="v6-surface border border-foreground/10 rounded-3xl p-10 md:p-14 space-y-6">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            Switching is Simple<span className="v6-accent-text">.</span>
          </h2>
          <p className="opacity-60 text-sm leading-relaxed max-w-xl">
            No migration, no account transfer needed. Browse the collection, create a free account in 30 seconds, and your first order ships free if it is RM100 or more. That is it.
          </p>
          <ol className="space-y-4">
            {[
              ["Browse", "See the full collection — no account needed."],
              ["Sign up", "Free. Takes 30 seconds. Unlocks wishlist and order tracking."],
              ["Order", "Free shipping on orders RM100+. Pay via FPX, card, or e-wallet."],
              ["Collect", "Figures arrive inspected, packed, and ready to display."],
            ].map(([step, desc], i) => (
              <li key={step} className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-v6-accent/10 border border-v6-accent/30 flex items-center justify-center font-black text-[10px] v6-accent-text shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <span className="font-black text-sm uppercase tracking-wide">{step}</span>
                  <span className="text-sm opacity-50 ml-2">{desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── CTA ── */}
        <div className="text-center space-y-6 bg-v6-accent/5 border border-v6-accent/20 rounded-3xl p-12 md:p-20">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Ready to Browse<span className="v6-accent-text">?</span>
          </h2>
          <p className="opacity-50 text-sm max-w-sm mx-auto leading-relaxed">
            Free shipping from RM100. Every figure inspected. No fakes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collection"
              className="inline-flex items-center justify-center gap-3 bg-v6-accent text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-xl shadow-v6-accent/20"
            >
              Browse Figures <ArrowRight size={18} />
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-3 v6-surface border border-foreground/10 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:border-v6-accent transition-all"
            >
              Join Free
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
