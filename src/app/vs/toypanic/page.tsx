import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Minus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault 6 vs ToyPanic | Which is Better for Waifu Figures in Malaysia?",
  description:
    "Vault 6 Studios vs ToyPanic — a side-by-side comparison for anime and waifu figure collectors in Malaysia. See differences in curation, shipping, pricing, and what each store does best.",
  openGraph: {
    title: "Vault 6 vs ToyPanic | Waifu Figure Store Comparison Malaysia",
    description:
      "Vault 6 specialises in waifu and anime figures. ToyPanic is a general toy marketplace. Here's how they compare.",
  },
};

const CHECK = <CheckCircle2 size={18} className="text-green-400 shrink-0" />;
const CROSS = <XCircle size={18} className="text-red-400 shrink-0" />;
const NEUTRAL = <Minus size={18} className="text-foreground/30 shrink-0" />;

const vsSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Vault 6 Studios better than ToyPanic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It depends on what you collect. Vault 6 Studios is better for waifu and anime figure collectors — it specialises exclusively in those figures, offers free shipping from RM100 (vs ToyPanic's RM200), and hand-inspects every piece. ToyPanic is better if you want a wide range of products including Hot Toys, Gundam kits, TCG, and video games."
      }
    },
    {
      "@type": "Question",
      "name": "What is the free shipping threshold at Vault 6 vs ToyPanic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vault 6 Studios offers free shipping on orders RM100 and above. ToyPanic offers free shipping on orders RM200 and above (Peninsula Malaysia only). Vault 6 has the lower threshold."
      }
    },
    {
      "@type": "Question",
      "name": "Does ToyPanic sell waifu figures?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ToyPanic does sell some anime figures, but it is a general toy marketplace — not a dedicated waifu or anime figure store. Its catalogue also includes Hot Toys, Gundam kits, die-cast cars, trading card games, and video games. Vault 6 Studios focuses exclusively on waifu and anime figures."
      }
    }
  ]
};

export default function VsToypanic() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vsSchema) }} />
      <Header />

      {/* Cinematic BG */}
      <div className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.025]">
        <p className="text-[18vw] font-black leading-[0.7] uppercase tracking-tighter">VAULT</p>
        <p className="text-[22vw] font-black leading-[0.7] uppercase text-outline">VS</p>
      </div>

      <div className="relative z-10 pt-40 pb-32 px-6 md:px-12 max-w-5xl mx-auto space-y-20">

        {/* ── Hero ── */}
        <div className="space-y-6">
          <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em] block">
            Store Comparison · Malaysia
          </span>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            Vault 6 vs<br />ToyPanic<span className="v6-accent-text">.</span>
          </h1>
          <p className="text-base md:text-lg opacity-60 max-w-xl leading-relaxed font-medium">
            ToyPanic is one of the biggest toy stores in Malaysia. Vault 6 is built specifically for waifu and anime figure collectors. Here is how they compare, and who each one is right for.
          </p>
        </div>

        {/* ── TL;DR ── */}
        <div className="v6-surface border border-foreground/10 rounded-3xl p-8 md:p-12 space-y-4">
          <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em]">TL;DR</span>
          <p className="text-base md:text-lg font-medium leading-relaxed opacity-80">
            <strong>Vault 6</strong> is for collectors who want waifu and anime figures only — with hand-inspected stock, free shipping from RM100, and a dedicated community. <strong>ToyPanic</strong> is a general-purpose toy marketplace carrying everything from Gundam kits to video games — good if you want variety under one roof.
          </p>
        </div>

        {/* ── Comparison Table ── */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            Side by Side<span className="v6-accent-text">.</span>
          </h2>
          <div className="overflow-x-auto rounded-3xl border border-foreground/10">
            <table className="w-full text-sm font-medium">
              <thead>
                <tr className="border-b border-foreground/10 v6-surface">
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest opacity-40">Feature</th>
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest v6-accent-text">Vault 6 Studios</th>
                  <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest opacity-40">ToyPanic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {[
                  ["Specialisation",        "Waifu & anime figures only",           "All toys — figures, games, kits, TCG"],
                  ["Free shipping",         "RM 100+",                              "RM 200+"],
                  ["Stock curation",        "Hand-inspected, curated selection",    "Large open marketplace catalogue"],
                  ["Authenticity guarantee","Every piece verified before listing",  "Genuine brands stocked"],
                  ["Membership & loyalty",  "Tiered rewards (RECRUIT → DIRECTOR)", "No public loyalty programme"],
                  ["Wishlist",              "Save & track figures you want",        "Not available"],
                  ["Physical store",        "Online only",                          "Penang (2 locations)"],
                  ["Site experience",       "Modern, mobile-first",                 "Legacy ASP.NET site"],
                  ["Pre-orders",            "Available for select figures",         "Available"],
                  ["Payment (Malaysia)",    "FPX, credit/debit, e-wallets",        "Various methods"],
                  ["Founded",               "2024",                                 "2010"],
                ].map(([feature, v6, tp]) => (
                  <tr key={feature} className="hover:v6-surface transition-colors">
                    <td className="p-5 font-black text-[11px] uppercase tracking-wider opacity-50">{feature}</td>
                    <td className="p-5 font-medium text-sm">{v6}</td>
                    <td className="p-5 font-medium text-sm opacity-60">{tp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Deep Comparison ── */}
        <div className="space-y-12">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            What Actually Matters<span className="v6-accent-text">.</span>
          </h2>

          {[
            {
              title: "Specialisation",
              v6: { label: "Vault 6 wins", icon: CHECK, text: "Every figure in the Vault 6 catalogue is a waifu or anime character piece. No Gundam kits, no Hot Wheels, no trading cards. If you collect anime figures, you are looking at a store built entirely around your hobby — not a corner of a general toy shop." },
              tp: { label: "ToyPanic wins for variety", icon: CHECK, text: "ToyPanic stocks Hot Toys, Bandai, Kotobukiya, Sideshow, die-cast, TCG, and video games. If you collect across multiple categories, ToyPanic gives you everything in one place." },
            },
            {
              title: "Shipping & Cost",
              v6: { label: "Vault 6 wins", icon: CHECK, text: "Free shipping kicks in at RM100 — the lowest free-shipping threshold of any major Malaysian figure store. Most waifu figures cross this easily. No flat-rate P&P surprises on small orders." },
              tp: { label: "Higher threshold", icon: CROSS, text: "ToyPanic's free shipping starts at RM200. Buyers report frustration with the flat-rate P&P on smaller orders — the cost can be as much as the item itself when buying a single RM50–80 figure." },
            },
            {
              title: "Curation & Quality Assurance",
              v6: { label: "Vault 6 wins", icon: CHECK, text: "Every figure is physically inspected before it goes into the inventory. Damaged boxes, flawed paint, or misaligned parts do not make it onto the listing. You know what you are buying." },
              tp: { label: "Genuine but uncurated", icon: NEUTRAL, text: "ToyPanic stocks genuine branded products from established names. They do not advertise a per-item inspection process — the quality assurance is at the brand level, not the individual piece level." },
            },
            {
              title: "Loyalty & Community",
              v6: { label: "Vault 6 wins", icon: CHECK, text: "A tiered membership programme rewards returning collectors. Save figures to your wishlist, track your orders, and unlock better status the more you collect. Built for the long-term collector relationship." },
              tp: { label: "No formal programme", icon: CROSS, text: "ToyPanic has strong brand loyalty from 15 years in the market but no public-facing loyalty or rewards programme." },
            },
            {
              title: "Physical Presence",
              v6: { label: "ToyPanic wins", icon: CROSS, text: "Vault 6 is online-only. If you want to walk in, handle the box, and buy in person — Vault 6 is not for you (yet)." },
              tp: { label: "ToyPanic wins", icon: CHECK, text: "Two physical stores in Penang. Great for Penang-based collectors who want to browse and buy in person. Also adds trust for buyers skeptical of online-only stores." },
            },
          ].map(({ title, v6, tp }) => (
            <div key={title} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-xl font-black uppercase tracking-wider mb-4">{title}</h3>
              </div>
              <div className="v6-surface border border-v6-accent/20 rounded-3xl p-8 space-y-3">
                <div className="flex items-center gap-2">
                  {v6.icon}
                  <span className="text-[9px] font-black v6-accent-text uppercase tracking-widest">{v6.label}</span>
                </div>
                <p className="text-sm leading-relaxed opacity-70">{v6.text}</p>
              </div>
              <div className="v6-surface border border-foreground/10 rounded-3xl p-8 space-y-3">
                <div className="flex items-center gap-2">
                  {tp.icon}
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-50">{tp.label}</span>
                </div>
                <p className="text-sm leading-relaxed opacity-50">{tp.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Who Each Is For ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-v6-accent/5 border border-v6-accent/20 rounded-3xl p-10 space-y-4">
            <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em] block">Choose Vault 6 if…</span>
            <ul className="space-y-3">
              {[
                "You collect waifu or anime figures specifically",
                "You want stock that has been checked before it ships",
                "Your orders are usually RM100–200 and you want free shipping",
                "You want a wishlist and loyalty rewards",
                "You prefer a clean, fast online shopping experience",
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  {CHECK}
                  <span className="opacity-80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="v6-surface border border-foreground/10 rounded-3xl p-10 space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] block opacity-40">Choose ToyPanic if…</span>
            <ul className="space-y-3">
              {[
                "You want to buy figures, games, kits, and TCG in one order",
                "You are based in Penang and want to shop in person",
                "You collect Hot Toys, Bandai, or Sideshow specifically",
                "You want the widest possible selection of brands",
                "You are an established ToyPanic customer happy with them",
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 size={18} className="text-foreground/30 shrink-0" />
                  <span className="opacity-50">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center space-y-6 v6-surface border border-foreground/10 rounded-3xl p-12 md:p-20">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            See the Collection<span className="v6-accent-text">.</span>
          </h2>
          <p className="opacity-50 text-sm max-w-md mx-auto leading-relaxed">
            Every figure hand-picked and inspected. Free shipping from RM100. No account needed to browse.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center gap-3 bg-v6-accent text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-xl shadow-v6-accent/20"
          >
            Browse Figures <ArrowRight size={18} />
          </Link>
        </div>

        <Footer />
      </div>
    </main>
  );
}
