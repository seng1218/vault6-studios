import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "5 Best ToyPanic Alternatives in Malaysia (2026) | Anime & Waifu Figures",
  description:
    "Looking for ToyPanic alternatives in Malaysia? Here are the 5 best options for anime and waifu figure collectors — with honest comparisons on pricing, shipping, and specialisation.",
  openGraph: {
    title: "5 Best ToyPanic Alternatives in Malaysia 2026",
    description:
      "Vault 6, Shirotoys, FigFind, Oh! Gatcha, HobbyDigi — here is how the top Malaysian anime figure stores compare to ToyPanic.",
  },
};

const stores = [
  {
    rank: 1,
    name: "Vault 6 Studios",
    url: "/collection",
    external: false,
    tag: "Best for waifu & anime figures",
    tagColor: "bg-v6-accent text-white",
    desc: "Malaysia's dedicated waifu and anime figure store. Every piece is hand-inspected before it is listed — no fakes, no damaged stock. Free shipping kicks in at RM100 (the lowest threshold of any major store), and a tiered loyalty programme rewards collectors who keep coming back.",
    pros: [
      "Waifu & anime figures only — no filler products",
      "Free shipping from RM100",
      "Every figure hand-inspected before listing",
      "Wishlist + member loyalty programme",
      "Clean, mobile-friendly site",
    ],
    cons: [
      "Online only — no physical store",
      "Smaller catalogue than general marketplaces",
    ],
    shipping: "Free from RM100",
    focus: "Waifu & anime figures",
    highlight: true,
  },
  {
    rank: 2,
    name: "Shirotoys",
    url: "https://www.shirotoys.com",
    external: true,
    tag: "Best for Good Smile Company",
    tagColor: "bg-foreground/10 text-foreground",
    desc: "Official Good Smile Company partner in Malaysia. Strong range of Nendoroids, scale figures, and Figmas. Also stocks board games. Good stock depth on popular characters but heavy pre-order model. Note: strict no-return policy — even manufacturer defects on opened figures are generally not accepted.",
    pros: [
      "Official GSC partner — guaranteed genuine GSC stock",
      "Wide Nendoroid and scale figure range",
      "Established and trusted brand",
      "Accepts most Malaysian payment methods",
    ],
    cons: [
      "Strict no-return, no-refund policy",
      "Heavy pre-order model — less ready stock",
      "No free shipping threshold publicly advertised",
      "Also sells board games — less figure-focused",
    ],
    shipping: "Not publicly specified",
    focus: "Anime figures, board games",
    highlight: false,
  },
  {
    rank: 3,
    name: "FigFind",
    url: "https://www.figfind.shop",
    external: true,
    tag: "Fastest delivery",
    tagColor: "bg-foreground/10 text-foreground",
    desc: "A newer store (founded 2021) built around speed. Claims delivery within 3–12 days after release — skipping the usual 3-month Malaysia delay. Offers a 100% authentic money-back guarantee and sources directly from Japan. Carries GSC, Furyu, FREEing, and Alter. Good for collectors who want figures fast.",
    pros: [
      "Fastest delivery of any Malaysian store (3–12 days post-release)",
      "100% authentic money-back guarantee",
      "Direct Japan sourcing",
      "Good for scale figure hunters",
    ],
    cons: [
      "Newer brand — shorter track record",
      "Smaller catalogue than older stores",
      "Limited information on free shipping policy",
    ],
    shipping: "No extra shipping cost advertised",
    focus: "Anime scale figures, fast delivery",
    highlight: false,
  },
  {
    rank: 4,
    name: "Oh! Gatcha",
    url: "https://ohgatcha.com",
    external: true,
    tag: "Best with physical stores (KL/PJ)",
    tagColor: "bg-foreground/10 text-foreground",
    desc: "Official licensed hobby store with physical locations at IOI Mall Puchong, IOI City Mall Putrajaya, and Petaling Jaya. Good range of scale figures, prize figures, and Nendoroids. Pricing on the higher side due to mall locations. Good option if you are in the Klang Valley and want to shop in person.",
    pros: [
      "Official licensed store",
      "Physical locations in KL / PJ area",
      "Prize figures and scale figures in stock",
      "Friendly in-store staff",
    ],
    cons: [
      "Mall pricing premium",
      "Limited waifu-specific curation",
      "Shipping policy not clearly published",
    ],
    shipping: "Calculated at checkout",
    focus: "Anime figures, prize figures",
    highlight: false,
  },
  {
    rank: 5,
    name: "ToyPanic",
    url: "https://www.toypanic.com",
    external: true,
    tag: "Widest general selection",
    tagColor: "bg-foreground/10 text-foreground",
    desc: "The store you are moving away from — but worth understanding what it does well. ToyPanic has the widest product range of any Malaysian store: Hot Toys, Bandai, Kotobukiya, TCG, video games, tools. 15 years established with physical stores in Penang. Better if you collect across multiple hobby categories.",
    pros: [
      "Largest catalogue in Malaysia",
      "Physical stores in Penang",
      "15 years of trusted operation",
      "Price match page available",
    ],
    cons: [
      "Free shipping only from RM200",
      "Not waifu/anime specific — lots of unrelated stock",
      "Legacy ASP.NET website",
      "No loyalty or wishlist features",
    ],
    shipping: "Free from RM200 (Peninsula)",
    focus: "All toys, games, figures, kits",
    highlight: false,
  },
];

export default function ToypancAlternatives() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <Header />

      <div className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.025]">
        <p className="text-[14vw] font-black leading-[0.7] uppercase tracking-tighter">TOP</p>
        <p className="text-[22vw] font-black leading-[0.7] uppercase text-outline">STORES</p>
      </div>

      <div className="relative z-10 pt-40 pb-32 px-6 md:px-12 max-w-5xl mx-auto space-y-20">

        {/* ── Hero ── */}
        <div className="space-y-6">
          <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em] block">
            Store Guide · Malaysia · 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            5 ToyPanic<br />Alternatives<span className="v6-accent-text">.</span>
          </h1>
          <p className="text-base md:text-lg opacity-60 max-w-xl leading-relaxed font-medium">
            ToyPanic is a solid general toy store. But if you are a waifu and anime figure collector, there are better options. Here is an honest breakdown of the top stores in Malaysia.
          </p>
          <p className="text-xs opacity-30 font-medium">Last updated: June 2026</p>
        </div>

        {/* ── What to look for ── */}
        <div className="v6-surface border border-foreground/10 rounded-3xl p-8 md:p-12 space-y-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">What to Look For in a ToyPanic Alternative</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Specialisation", "Does the store focus on anime figures, or is it a general toy shop? A focused store usually means better curation."],
              ["Free shipping threshold", "ToyPanic charges shipping on orders under RM200. Look for stores with lower (or no) thresholds."],
              ["Authenticity policy", "Does the store have an explicit guarantee? Or do they just say 'we stock genuine brands'?"],
              ["Returns & buyer protection", "Some stores have strict no-return policies. Read the fine print before you order."],
            ].map(([title, body]) => (
              <div key={title} className="space-y-2">
                <p className="font-black text-sm uppercase tracking-wide">{title}</p>
                <p className="text-xs opacity-50 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Store List ── */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            The Stores<span className="v6-accent-text">.</span>
          </h2>
          {stores.map((store) => (
            <div
              key={store.name}
              className={`rounded-3xl p-8 md:p-12 border space-y-6 ${
                store.highlight
                  ? "bg-v6-accent/5 border-v6-accent/30"
                  : "v6-surface border-foreground/10"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] opacity-30 font-black uppercase tracking-widest">#{store.rank}</span>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                      {store.name}
                      {store.highlight && <span className="v6-accent-text">.</span>}
                    </h3>
                  </div>
                  <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${store.tagColor}`}>
                    {store.tag}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Shipping</p>
                  <p className="text-xs font-black">{store.shipping}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed opacity-70">{store.desc}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Pros</p>
                  <ul className="space-y-1.5">
                    {store.pros.map(p => (
                      <li key={p} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 size={13} className={store.highlight ? "text-green-400 shrink-0 mt-0.5" : "text-foreground/30 shrink-0 mt-0.5"} />
                        <span className={store.highlight ? "opacity-80" : "opacity-50"}>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Cons</p>
                  <ul className="space-y-1.5">
                    {store.cons.map(c => (
                      <li key={c} className="flex items-start gap-2 text-xs opacity-50">
                        <span className="shrink-0 mt-0.5 w-3.5 text-center">–</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {store.external ? (
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  Visit {store.name} <ExternalLink size={13} />
                </a>
              ) : (
                <Link
                  href={store.url}
                  className="inline-flex items-center gap-2 bg-v6-accent text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-lg shadow-v6-accent/20"
                >
                  Browse Vault 6 <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* ── Summary Table ── */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            Quick Comparison<span className="v6-accent-text">.</span>
          </h2>
          <div className="overflow-x-auto rounded-3xl border border-foreground/10">
            <table className="w-full text-sm font-medium">
              <thead>
                <tr className="border-b border-foreground/10 v6-surface">
                  {["Store", "Focus", "Free Shipping", "Authenticity", "Loyalty"].map(h => (
                    <th key={h} className="text-left p-4 text-[9px] font-black uppercase tracking-widest opacity-40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {[
                  ["Vault 6 Studios",  "Waifu / Anime",       "RM 100+",     "Hand-inspected",        "Yes — tiered"],
                  ["Shirotoys",        "Anime + Board games",  "Not stated",  "Official GSC partner",  "No"],
                  ["FigFind",          "Anime scale figures",  "Included",    "Money-back guarantee",  "No"],
                  ["Oh! Gatcha",       "Anime + Prize",        "At checkout", "Official licensed",     "No"],
                  ["ToyPanic",         "All toys & games",     "RM 200+",     "Branded stock",         "No"],
                ].map(([name, focus, ship, auth, loyalty]) => (
                  <tr key={name} className={`hover:v6-surface transition-colors ${name === "Vault 6 Studios" ? "bg-v6-accent/5" : ""}`}>
                    <td className="p-4 font-black text-xs">{name}</td>
                    <td className="p-4 text-xs opacity-60">{focus}</td>
                    <td className={`p-4 text-xs font-black ${name === "Vault 6 Studios" ? "v6-accent-text" : "opacity-60"}`}>{ship}</td>
                    <td className="p-4 text-xs opacity-60">{auth}</td>
                    <td className={`p-4 text-xs font-black ${loyalty === "Yes — tiered" ? "v6-accent-text" : "opacity-40"}`}>{loyalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recommendation by use case ── */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            Which One Should You Pick<span className="v6-accent-text">?</span>
          </h2>
          <div className="space-y-4">
            {[
              { use: "You collect waifu and anime figures", pick: "Vault 6 Studios", reason: "Built specifically for this. Free shipping from RM100, every piece inspected, loyalty programme for regulars." },
              { use: "You want Good Smile Company Nendoroids", pick: "Shirotoys", reason: "Official GSC partner — widest GSC stock and best supply on Nendoroids." },
              { use: "You want figures as fast as possible after release", pick: "FigFind", reason: "3–12 days post-release with money-back guarantee. Fastest in Malaysia." },
              { use: "You are in KL / PJ and want to shop in person", pick: "Oh! Gatcha", reason: "Physical stores in IOI Mall, IOI City Mall, and PJ. Official licensed." },
              { use: "You buy across many categories — figures, games, kits", pick: "ToyPanic", reason: "Unmatched catalogue breadth. Best for multi-category collectors." },
            ].map(({ use, pick, reason }) => (
              <div key={use} className="v6-surface border border-foreground/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                <p className="text-xs font-black uppercase tracking-wide opacity-50">{use}</p>
                <p className={`text-xs font-black uppercase tracking-wider ${pick === "Vault 6 Studios" ? "v6-accent-text" : "opacity-80"}`}>{pick}</p>
                <p className="text-xs opacity-40 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="text-center space-y-6 bg-v6-accent/5 border border-v6-accent/20 rounded-3xl p-12 md:p-20">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Start Collecting<span className="v6-accent-text">.</span>
          </h2>
          <p className="opacity-50 text-sm max-w-sm mx-auto leading-relaxed">
            Waifu figures. Inspected stock. Free shipping from RM100.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center justify-center gap-3 bg-v6-accent text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-xl shadow-v6-accent/20"
          >
            Browse Vault 6 <ArrowRight size={18} />
          </Link>
        </div>

        <Footer />
      </div>
    </main>
  );
}
