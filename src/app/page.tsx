"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useInView,
  type MotionValue,
} from "framer-motion";
import { ShieldCheck, Activity, ArrowRight, Search, ChevronDown, Loader2, Truck } from "lucide-react";
import { useSettings } from "@/components/settings-provider";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";
import { EntranceSequence } from "@/components/entrance-sequence";

const MorphReveal = dynamic(
  () => import("@/components/morph-reveal").then((mod) => mod.MorphReveal),
  { ssr: false }
);

const FigurineShowcase = dynamic(
  () => import("@/components/figurine-showcase").then((mod) => mod.FigurineShowcase),
  { ssr: false }
);

// ─── SplitWords ──────────────────────────────────────────────────────────────
// Masks each word so it slides up from hidden on scroll enter.
function SplitWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className ?? ""}`} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : {}}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.09 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── MarqueeStrip ─────────────────────────────────────────────────────────────
// Horizontal ticker with subtle scroll-parallax drift.
function MarqueeStrip({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reverse ? ["4%", "-4%"] : ["-4%", "4%"]);
  const items = Array(10).fill(text);
  return (
    <div ref={ref} className="relative overflow-hidden py-5 border-y border-foreground/10 v6-surface-sm">
      <motion.div style={{ x }} className="flex whitespace-nowrap will-change-transform">
        {items.map((t, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] opacity-20 shrink-0 mr-12">
            {t} <span className="v6-accent-text mx-6">◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── FadeSlide ────────────────────────────────────────────────────────────────
// Reusable scroll-triggered fade + directional translate.
function FadeSlide({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const initial =
    direction === "up"
      ? { y: 60, opacity: 0 }
      : direction === "left"
      ? { x: -50, opacity: 0 }
      : { x: 50, opacity: 0 };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { y: 0, x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [trackId, setTrackId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEntranceActive, setIsEntranceActive] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [syndicateSuccess, setSyndicateSuccess] = useState(false);

  const { settings } = useSettings();

  // ── Scroll progress ──────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { damping: 30, stiffness: 150 });

  // ── Loading screen ───────────────────────────────────────────────────────
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setIsEntranceActive(true);
      }, 80);
    };

    // Fake progress fills to 85% — holds there until images are ready
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 85) { clearInterval(interval); return 85; }
        return Math.min(prev + Math.floor(Math.random() * 12) + 6, 85);
      });
    }, 22);

    // Wait for logo + first morph frame to be decoded before proceeding
    const critical = ["/logo.png", "/frames/01.png"];
    Promise.all(
      critical.map((src) => {
        const img = new window.Image();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        });
      })
    ).then(finish);

    // Hard fallback — never block longer than 3.5s on slow connections
    const fallback = setTimeout(finish, 3500);

    return () => { clearInterval(interval); clearTimeout(fallback); };
  }, []);

  const handleHomeTrack = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (trackId) router.push(`/tracking?id=${trackId}`);
  };

  const handleSyndicateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessSound();
    setSyndicateSuccess(true);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What does Vault 6 Studios sell?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vault 6 Studios sells waifu and anime figures in Malaysia. We stock scale figures, prize figures, and character figures from Japanese anime franchises. Every figure is hand-inspected before listing."
        }
      },
      {
        "@type": "Question",
        "name": "Does Vault 6 Studios offer free shipping in Malaysia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Vault 6 Studios offers free shipping on all orders RM100 and above to Peninsula Malaysia. This is one of the lowest free-shipping thresholds among Malaysian anime figure stores."
        }
      },
      {
        "@type": "Question",
        "name": "Are the figures sold by Vault 6 Studios genuine?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every figure listed on Vault 6 Studios is physically inspected before it is added to the catalogue. We do not list figures with damaged boxes, flawed paint, or manufacturing defects."
        }
      },
      {
        "@type": "Question",
        "name": "How do I pay at Vault 6 Studios?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vault 6 Studios accepts FPX (online banking), credit cards, debit cards, and e-wallets. Payments are processed securely via Fiuu."
        }
      },
      {
        "@type": "Question",
        "name": "Does Vault 6 Studios have a loyalty programme?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Vault 6 Studios has a free tiered membership programme. Members start as RECRUIT and progress to AGENT, OPERATIVE, and DIRECTOR based on order history. Members get access to a wishlist and order tracking."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between Vault 6 Studios and ToyPanic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vault 6 Studios specialises exclusively in waifu and anime figures. ToyPanic is a general toy marketplace stocking figures, games, kits, and trading cards. Vault 6 also has a lower free-shipping threshold (RM100 vs RM200) and hand-inspects every figure before listing."
        }
      }
    ]
  };

  return (
    <main
      id="main-container"
      className="relative w-full bg-background text-foreground font-sans selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progressScaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-v6-accent origin-left z-[200] shadow-[0_0_8px_var(--v6-accent)]"
      />

      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            role="status"
            aria-live="polite"
            aria-label="Loading Vault 6 Studios"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-12"
          >
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between font-mono text-[10px] tracking-widest opacity-40 uppercase">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={12} />
                  <span>Loading...</span>
                </div>
                <span>{loadingProgress}%</span>
              </div>
              <div className="h-[1px] w-full bg-foreground/5 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="absolute h-full bg-v6-accent shadow-[0_0_15px_var(--v6-glow)]"
                />
              </div>
              <div className="font-mono text-[8px] opacity-20 uppercase flex flex-col gap-1">
                <span>&gt; Checking stock...</span>
                <span>&gt; Verifying items...</span>
                <span>&gt; Almost ready...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      {/* Entrance Animation Sequence */}
      <AnimatePresence>
        {isEntranceActive && (
          <EntranceSequence onComplete={() => {
            setIsEntranceActive(false);
            playSuccessSound();
          }} />
        )}
      </AnimatePresence>

      {/* Persistent Morphing Background (Inspiration Design) */}
      <div key={theme} className="fixed inset-0 z-0 pointer-events-none">
        <MorphReveal
          images={[
            "/frames/01.png",
            "/frames/26.png",
            "/frames/27.png",
            "/frames/28.png"
          ]}
          isFullPage={true}
        />
      </div>

      {/* ─── SECTIONS ─── */}
      <section className="relative min-h-screen w-full flex items-center justify-center py-20">
        <Slide>
          <div className="text-center max-w-5xl dark:md:mix-blend-exclusion">
            <motion.h1
              className="text-[12vw] md:text-[10vw] font-black italic leading-[0.85] tracking-tighter uppercase"
            >
              <motion.span
                className="text-foreground md:text-inherit"
                animate={{
                  textShadow: [
                    "0 0 0px transparent",
                    "2px 0 12px var(--v6-glow)",
                    "-2px 0 12px rgba(255,0,0,0.08)",
                    "0 0 0px transparent",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 2.0 }}
              >
                {settings.hero_title}
              </motion.span>
              {" "}<br />
              <motion.span
                animate={{ opacity: [1, 0.8, 1, 0.9, 1] }}
                transition={{ repeat: Infinity, duration: 0.1, repeatDelay: 3.5 }}
                className="text-outline border-foreground/50"
              >
                {settings.hero_subtitle}
              </motion.span>
              <span className="v6-accent-text">.</span>
            </motion.h1>

            <p className="mt-8 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed opacity-70 uppercase tracking-widest">
              {settings.hero_description}
            </p>

            <div className="flex flex-col items-center justify-center mt-12 pointer-events-auto">
              <Link
                href="/collection"
                onMouseEnter={() => playHoverSound()}
                onClick={playClickSound}
                className="group relative bg-foreground text-background px-12 py-6 font-black text-xs uppercase tracking-[0.4em] flex items-center gap-4 hover:text-white transition-all overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-v6-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
                <span className="relative z-10 font-black">Shop Now</span>
                <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={18} />
              </Link>
            </div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="mt-20 opacity-25 flex flex-col items-center gap-2"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.4em]">Scroll down</span>
              <ChevronDown size={18} />
            </motion.div>
          </div>
        </Slide>
      </section>

      <section className="relative min-h-screen w-full flex items-center justify-center py-20 px-6">
        <FadeSlide>
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 pointer-events-auto">
            {/* Main Cell */}
            <div className="md:col-span-2 md:row-span-2 v6-surface backdrop-blur-3xl p-10 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-foreground/15 flex flex-col justify-center relative overflow-hidden group">
              {/* Laser Scan Animation */}
              <motion.div
                initial={{ top: "-10%" }}
                whileHover={{ top: "110%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_20px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
              />
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-mono text-[120px] md:text-[200px] leading-none pointer-events-none group-hover:opacity-[0.06] transition-opacity">01</div>
              <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">
                Our Promise
              </span>
              <h2 className="text-6xl md:text-8xl font-black italic leading-[0.85] tracking-tighter mb-8 uppercase">
                What We <br/>Stand For<span className="v6-accent-text">.</span>
              </h2>
              <p className="opacity-80 text-lg leading-relaxed font-medium max-w-sm">
                Every figure is checked by hand before we list it. No fakes — only pieces we&apos;d be happy to own ourselves.
              </p>
            </div>

            <div className="md:col-span-2 v6-surface-sm backdrop-blur-3xl p-10 rounded-[2.5rem] md:rounded-[3rem] border border-foreground/15 flex flex-col justify-between group hover:border-v6-accent/30 transition-colors relative overflow-hidden">
               {/* Laser Scan Animation */}
               <motion.div
                 initial={{ top: "-10%" }}
                 whileHover={{ top: "110%" }}
                 transition={{ duration: 1.2, ease: "linear" }}
                 className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
               />
               
               <div className="flex justify-between items-start relative z-10">
                  <div className="w-12 h-12 bg-v6-accent/20 rounded-xl flex items-center justify-center group-hover:bg-v6-accent transition-colors">
                    <Activity className="v6-accent-text group-hover:text-white" size={20} />
                  </div>
                  <span className="font-mono text-[10px] opacity-40">LVL_S_CLEARANCE</span>
               </div>
               <div className="relative z-10">
                  <h3 className="text-3xl font-black italic mb-2 uppercase">Hand-Picked Only</h3>
                  <p className="opacity-60 text-sm leading-relaxed max-w-xs uppercase font-bold tracking-widest">We only stock what passes our check. If it&apos;s not good enough for us, it&apos;s not good enough for you.</p>
               </div>
            </div>

            {/* Authenticity Cell */}
            <div className="md:col-span-1 v6-surface-xs backdrop-blur-3xl p-10 rounded-[2.5rem] md:rounded-[3rem] border border-foreground/10 flex flex-col justify-between group hover:border-v6-accent/30 transition-colors relative overflow-hidden">
              {/* Laser Scan Animation */}
              <motion.div
                initial={{ top: "-10%" }}
                whileHover={{ top: "110%" }}
                transition={{ duration: 1.2, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
              />

              <div className="w-12 h-12 bg-v6-accent/20 rounded-xl flex items-center justify-center group-hover:bg-v6-accent transition-colors relative z-10">
                <ShieldCheck className="v6-accent-text group-hover:text-white" size={20} />
              </div>
              <h3 className="text-2xl font-black italic mt-4 uppercase leading-none tracking-tighter relative z-10">100% <br/>Genuine</h3>
            </div>

            {/* Secure Shipping Cell */}
            <div className="md:col-span-1 v6-surface-xs backdrop-blur-3xl p-10 rounded-[2.5rem] md:rounded-[3rem] border border-foreground/10 flex flex-col justify-between group hover:border-v6-accent/30 transition-colors relative overflow-hidden">
              {/* Laser Scan Animation */}
              <motion.div
                initial={{ top: "-10%" }}
                whileHover={{ top: "110%" }}
                transition={{ duration: 1.2, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
              />
              <div className="w-12 h-12 bg-v6-accent/20 rounded-xl flex items-center justify-center group-hover:bg-v6-accent transition-colors relative z-10">
                <Truck className="v6-accent-text group-hover:text-white" size={20} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black italic uppercase leading-none tracking-tighter mb-2">Nationwide <br/>Shipping</h3>
                <p className="opacity-60 text-[9px] uppercase font-bold tracking-widest leading-tight">Malaysia-wide logistics network. Vault-to-door delivery.</p>
              </div>
            </div>
          </div>
        </FadeSlide>
      </section>

      <section className="relative w-full flex items-center justify-center py-16 md:py-24 px-6">
        <FadeSlide className="w-full">
          <div className="w-full max-w-7xl mx-auto v6-surface backdrop-blur-3xl p-8 md:p-16 rounded-[3rem] border border-foreground/10 pointer-events-auto">
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="space-y-2 max-w-2xl">
                <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] block">
                  Browse Our Range
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-none uppercase">
                  Pick Your <br/>Figure<span className="v6-accent-text">.</span>
                </h2>
              </div>
              <FigurineShowcase />
            </div>
          </div>
        </FadeSlide>
      </section>

      <section className="relative min-h-screen w-full flex items-center justify-center py-20">
        <FadeSlide>
          <div className="max-w-4xl w-full mx-auto px-6 pointer-events-auto">
            <div className="v6-surface backdrop-blur-3xl border border-foreground/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-v6-accent/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase leading-none">Track Your Shipment</h2>
                <p className="opacity-60 text-sm font-bold mb-12 tracking-widest uppercase">
                  See where your order is right now
                </p>
                <form onSubmit={handleHomeTrack} className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <label htmlFor="tracking-input" className="sr-only">Tracking Number</label>
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={20} aria-hidden="true" />
                    <input
                      id="tracking-input"
                      type="text"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                      placeholder="ENTER YOUR ORDER NUMBER"
                      className="w-full bg-foreground/5 border border-foreground/10 text-foreground pl-16 pr-6 py-6 rounded-2xl font-black focus:border-v6-accent focus:outline-none focus:ring-2 focus:ring-v6-accent/40 transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-v6-accent text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all cursor-pointer"
                  >
                    Track Now
                  </button>
                </form>
              </div>
            </div>
          </div>
        </FadeSlide>
      </section>

      <section className="relative w-full py-20">
        <FadeSlide>
          <div className="flex flex-col items-center w-full pointer-events-auto">
            <div className="text-center v6-surface backdrop-blur-3xl p-8 md:p-32 rounded-[2.5rem] md:rounded-[5rem] border border-foreground/10 shadow-2xl relative overflow-hidden max-w-5xl w-full mx-6 mb-10 md:mb-20">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-v6-accent/10 rounded-full blur-[150px] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block text-[10px] bg-v6-accent text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 md:mb-8">
                  Logistics Link Established
                </span>

                <h2 className="text-4xl md:text-[6.5rem] font-black italic mb-6 md:mb-12 tracking-tighter uppercase leading-none">
                  JOIN THE <br />
                  <span className="v6-accent-text">SYNDICATE.</span>
                </h2>

                {syndicateSuccess ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mb-10 md:mb-20 max-w-2xl mx-auto py-6 px-10 rounded-2xl md:rounded-3xl border-2 border-v6-accent/40 bg-v6-accent/10 text-v6-accent font-black text-xs uppercase tracking-widest"
                  >
                    Connection secured. Access pending.
                  </div>
                ) : (
                  <form
                    onSubmit={handleSyndicateSubmit}
                    className="flex flex-col md:flex-row gap-4 mb-10 md:mb-20 max-w-2xl mx-auto"
                  >
                    <label htmlFor="syndicate-email" className="sr-only">Email address</label>
                    <input
                      id="syndicate-email"
                      type="email"
                      required
                      placeholder="YOUR ENCRYPTED EMAIL"
                      className="bg-background/40 border-2 border-foreground/10 rounded-2xl md:rounded-3xl py-4 md:py-6 px-8 md:px-12 focus:outline-none focus:border-v6-accent focus:ring-2 focus:ring-v6-accent/40 w-full md:w-[450px] font-black text-xs md:text-sm tracking-widest text-center"
                    />
                    <button
                      type="submit"
                      onMouseEnter={() => playHoverSound()}
                      className="bg-v6-accent text-white px-10 md:px-16 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.4em] hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-v6-accent/40 cursor-pointer"
                    >
                      REQUEST ACCESS
                    </button>
                  </form>
                )}

                <div className="flex justify-center gap-8 md:gap-16 text-[8px] md:text-[10px] font-black tracking-[0.5em] opacity-50">
                  <a href="#" className="hover:opacity-100 hover:text-v6-accent transition-all italic">INSTAGRAM</a>
                  <a href="#" className="hover:opacity-100 hover:text-v6-accent transition-all italic">TWITTER</a>
                  <a href="#" className="hover:opacity-100 hover:text-v6-accent transition-all italic">DISCORD</a>
                </div>
              </div>
            </div>
            <div className="w-full max-w-7xl px-6 opacity-40 hover:opacity-100 transition-opacity pb-20">
              <Footer />
            </div>
          </div>
        </FadeSlide>
      </section>
    </main>
  );
}

// ─── Slide Component ────────────────────────────────────────────────────────
function Slide({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
}
