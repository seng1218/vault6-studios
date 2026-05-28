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
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Activity, ArrowRight, Search, ChevronDown, Loader2 } from "lucide-react";
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
    <div ref={ref} className="relative overflow-hidden py-5 border-y border-foreground/[0.06] bg-foreground/[0.02]">
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

  const { settings } = useSettings();

  // ── Scroll progress ──────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, { damping: 30, stiffness: 150 });

  // ── Loading screen ───────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) { 
          clearInterval(interval); 
          setTimeout(() => {
            setIsLoading(false);
            setIsEntranceActive(true);
          }, 400);
          return 100; 
        }
        return Math.min(prev + Math.floor(Math.random() * 8) + 2, 100);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const handleHomeTrack = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (trackId) router.push(`/tracking?id=${trackId}`);
  };

  const handleSyndicateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessSound();
    alert("TRANSMISSION SECURED. CLEARANCE IS PENDING.");
  };

  return (
    <main
      id="main-container"
      className="relative w-full bg-background text-foreground font-sans selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden"
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progressScaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-v6-accent origin-left z-[200] shadow-[0_0_8px_var(--v6-accent)]"
      />

      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-12"
          >
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between font-mono text-[10px] tracking-widest opacity-40 uppercase">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={12} />
                  <span>Initializing Vault</span>
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
                <span>&gt; Sourcing Artifacts...</span>
                <span>&gt; Multi-Stage Verification Active...</span>
                <span>&gt; Establishing Secure Connection...</span>
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
          <div className="text-center max-w-5xl md:mix-blend-exclusion">
            <motion.h1
              className="text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter uppercase italic"
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

            <p className="mt-8 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed opacity-60">
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
                <span className="relative z-10 font-black">Enter Vault</span>
                <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={18} />
              </Link>
            </div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="mt-20 opacity-25 flex flex-col items-center gap-2"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.4em]">Scroll to Discover</span>
              <ChevronDown size={18} />
            </motion.div>
          </div>
        </Slide>
      </section>

      <section className="relative min-h-screen w-full flex items-center justify-center py-20">
        <FadeSlide>
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-foreground/5 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] border border-foreground/10 shadow-2xl overflow-hidden pointer-events-auto">
            <div>
              <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">
                Vault Standards
              </span>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-8">
                OUR ETHOS.
              </h2>
              <p className="opacity-60 text-lg leading-relaxed font-medium">
                Uncompromising standards. Every piece is hand-selected and multi-stage verified.
              </p>
            </div>

            <div className="space-y-12">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-v6-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-v6-accent transition-colors shrink-0">
                  <Activity className="v6-accent-text group-hover:text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black italic mb-2">CURATION</h3>
                  <p className="opacity-50 text-sm">If it isn&apos;t S-tier, it doesn&apos;t enter the Vault.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-v6-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-v6-accent transition-colors shrink-0">
                  <ShieldCheck className="v6-accent-text group-hover:text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black italic mb-2">AUTHENTICITY</h3>
                  <p className="opacity-50 text-sm">Direct sourcing and multi-stage verification.</p>
                </div>
              </div>
            </div>
          </div>
        </FadeSlide>
      </section>

      <section className="relative min-h-screen w-full flex items-center justify-center py-20">
        <FadeSlide>
          <div className="w-full max-w-7xl mx-auto px-6 pointer-events-auto">
            <div className="flex flex-col gap-8">
              <div className="space-y-2 max-w-2xl">
                <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] block">
                  Interactive Showroom
                </span>
                <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none">
                  VAULT 6 SYSTEM CORE CONFIGURATOR.
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
            <div className="bg-foreground/[0.03] dark:bg-foreground/[0.01] border border-foreground/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-v6-accent/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">Track Your Artifact</h2>
                <p className="opacity-40 text-sm font-bold mb-12 tracking-widest uppercase">
                  Secure tracking for your premium collectibles
                </p>
                <form onSubmit={handleHomeTrack} className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                    <input
                      type="text"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                      placeholder="ENTER TRACKING NUMBER"
                      className="w-full bg-foreground/5 border border-foreground/10 text-foreground pl-16 pr-6 py-6 rounded-2xl font-black focus:border-v6-accent outline-none transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-v6-accent text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all"
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
            <div className="text-center bg-v6-accent/5 backdrop-blur-3xl p-8 md:p-32 rounded-[2.5rem] md:rounded-[5rem] border border-v6-accent/20 shadow-2xl relative overflow-hidden max-w-5xl w-full mx-6 mb-10 md:mb-20">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-v6-accent/10 rounded-full blur-[150px] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block text-[10px] bg-v6-accent text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-4 md:mb-8">
                  Secured Connection
                </span>

                <h2 className="text-4xl md:text-[6rem] font-black mb-6 md:mb-12 tracking-tighter uppercase italic leading-none">
                  JOIN THE <br />
                  <span className="v6-accent-text">SYNDICATE.</span>
                </h2>

                <form
                  onSubmit={handleSyndicateSubmit}
                  className="flex flex-col md:flex-row gap-4 mb-10 md:mb-20 max-w-2xl mx-auto"
                >
                  <input
                    type="email"
                    required
                    placeholder="YOUR ENCRYPTED EMAIL"
                    className="bg-background/40 border-2 border-foreground/10 rounded-2xl md:rounded-3xl py-4 md:py-6 px-8 md:px-12 focus:outline-none focus:border-v6-accent w-full md:w-[450px] font-black text-xs md:text-sm tracking-widest text-center"
                  />
                  <button
                    type="submit"
                    onMouseEnter={() => playHoverSound()}
                    className="bg-v6-accent text-white px-10 md:px-16 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-v6-accent/40"
                  >
                    REQUEST ACCESS
                  </button>
                </form>

                <div className="flex justify-center gap-8 md:gap-16 text-[8px] md:text-[10px] font-black tracking-[0.5em] opacity-30">
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
