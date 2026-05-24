"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ImageSequenceViewer } from "@/components/image-sequence-viewer";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  motionValue,
  useMotionValue,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Activity, ArrowRight, Search, ChevronDown, Loader2 } from "lucide-react";
import type { FrameAdjustment } from "@/components/image-sequence-viewer";
import { useSettings } from "@/components/settings-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";

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
  const [trackId, setTrackId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHoveringVault, setIsHoveringVault] = useState(false);

  const figurineFrames = Array.from({ length: 25 }, (_, i) => `/frames/${(i + 1).toString().padStart(2, "0")}.png`);
  const frameAdjustments: FrameAdjustment[] = Array(25).fill({ scale: 1.0 });

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

  const { settings } = useSettings();

  // ── Scroll progress ──────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const springConfig = { damping: 40, stiffness: 200 };
  const smoothScrollYProgress = useSpring(scrollYProgress, { damping: 50, stiffness: 150 });
  const progressScaleX = useSpring(scrollYProgress, { damping: 30, stiffness: 150 });

  // ── Image sequence drive ─────────────────────────────────────────────────
  const time = motionValue(0);
  useEffect(() => {
    let raf: number;
    const update = (t: number) => { time.set(t); raf = requestAnimationFrame(update); };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [time]);

  const idleRotation = useMotionValue(0);
  const isScrollingRaw = useMotionValue(0);
  const blendValue = useSpring(0, { damping: 30, stiffness: 100 });

  useEffect(() => {
    let raf: number;
    const update = (t: number) => { idleRotation.set((t / 7000) % 1); raf = requestAnimationFrame(update); };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [idleRotation]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const scrolling = v > 0 ? Math.min(v / 0.01, 1) : 0;
      isScrollingRaw.set(scrolling);
      blendValue.set(scrolling > 0.5 ? 1 : 0);
    });
    return unsub;
  }, [scrollYProgress, isScrollingRaw, blendValue]);

  const combinedProgress = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      combinedProgress.set(
        idleRotation.get() * (1 - blendValue.get()) + smoothScrollYProgress.get() * blendValue.get()
      );
    };
    const u1 = smoothScrollYProgress.on("change", update);
    const u2 = idleRotation.on("change", update);
    const u3 = blendValue.on("change", update);
    return () => { u1(); u2(); u3(); };
  }, [smoothScrollYProgress, idleRotation, blendValue, combinedProgress]);

  const currentIndex = useMotionValue(0);
  useEffect(() => {
    const unsub = combinedProgress.on("change", (v) => {
      currentIndex.set(Math.max(0, Math.min(figurineFrames.length - 1, v * (figurineFrames.length - 1))));
    });
    return unsub;
  }, [combinedProgress, figurineFrames.length, currentIndex]);

  // ── Loading screen ───────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => setIsLoading(false), 200); return 100; }
        return Math.min(prev + Math.floor(Math.random() * 8) + 2, 100);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // ── Hero parallax ────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.65], [1, 0]);

  const x = useSpring(useTransform(scrollYProgress, [0, 0.4, 0.7, 1], ["0%", "22%", "-22%", "0%"]), springConfig);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 0.9]), springConfig);

  return (
    <main
      id="main-container"
      className="relative w-full bg-background overflow-x-hidden text-foreground font-sans selection:bg-v6-accent selection:text-white transition-colors duration-500"
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

      {/* Fixed 3D background */}
      <div className="fixed inset-0 z-0 bg-background">
        <ImageSequenceViewer
          imageUrls={figurineFrames}
          currentIndex={currentIndex}
          fusionUrls={figurineFrames.slice(10, 15)}
          x={x}
          scale={scale}
          frameAdjustments={frameAdjustments}
          scrollYProgress={smoothScrollYProgress}
          isHovered={isHoveringVault}
        />
      </div>

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center px-6 z-10 pointer-events-none"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center max-w-5xl mix-blend-exclusion will-change-transform"
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter uppercase italic"
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 0px transparent",
                  "2px 0 12px var(--v6-glow)",
                  "-2px 0 12px rgba(255,0,0,0.08)",
                  "0 0 0px transparent",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 3.5 }}
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

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.8, delay: 2.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed"
          >
            {settings.hero_description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center mt-12 pointer-events-auto"
          >
            <Link
              href="/collection"
              onMouseEnter={() => { playHoverSound(); setIsHoveringVault(true); }}
              onMouseLeave={() => setIsHoveringVault(false)}
              onClick={playClickSound}
              className="group relative bg-foreground text-background px-12 py-6 font-black text-xs uppercase tracking-[0.4em] flex items-center gap-4 hover:text-white transition-all overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-v6-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
              <span className="relative z-10 font-black">Enter Vault</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={18} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 opacity-25"
        >
          <ChevronDown size={22} />
        </motion.div>
      </section>

      {/* ─── MARQUEE 1 ─────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <MarqueeStrip text="VAULT 6 STUDIOS — CERTIFIED AUTHENTIC — PREMIUM COLLECTIBLES — DIRECT SOURCED" />
      </div>

      {/* ─── ETHOS ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 md:px-24 z-10 py-32">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-foreground/5 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] border border-foreground/10 shadow-2xl overflow-hidden">
          <FadeSlide direction="left">
            <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">
              Vault Standards
            </span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-8">
              <SplitWords text="OUR ETHOS." />
            </h2>
            <p className="opacity-60 text-lg leading-relaxed font-medium">
              Uncompromising standards. Every piece is hand-selected and multi-stage verified.
            </p>
          </FadeSlide>

          <div className="space-y-12">
            <FadeSlide delay={0.18} direction="right">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-v6-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-v6-accent transition-colors shrink-0">
                  <Activity className="v6-accent-text group-hover:text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black italic mb-2">CURATION</h3>
                  <p className="opacity-50 text-sm">If it isn&apos;t S-tier, it doesn&apos;t enter the Vault.</p>
                </div>
              </div>
            </FadeSlide>

            <FadeSlide delay={0.33} direction="right">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 bg-v6-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-v6-accent transition-colors shrink-0">
                  <ShieldCheck className="v6-accent-text group-hover:text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black italic mb-2">AUTHENTICITY</h3>
                  <p className="opacity-50 text-sm">Direct sourcing and multi-stage verification.</p>
                </div>
              </div>
            </FadeSlide>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE 2 ─────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <MarqueeStrip text="INTERACTIVE SHOWROOM — SYSTEM CORE — REAL TIME CONFIGURATION — 3D INSPECT" reverse />
      </div>

      {/* ─── CONFIGURATOR ──────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 md:px-24 z-20 max-w-7xl mx-auto">
        <div className="flex flex-col gap-12">
          <FadeSlide className="space-y-4 max-w-2xl">
            <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] block">
              Interactive Showroom
            </span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
              <SplitWords text="SYSTEM CORE CONFIGURATOR." />
            </h2>
            <p className="opacity-60 text-sm md:text-base font-bold uppercase tracking-widest leading-relaxed">
              Rotate, inspect, and customize dynamic figurine specs and parameters in real time.
            </p>
          </FadeSlide>

          <FadeSlide delay={0.2} className="w-full">
            <FigurineShowcase />
          </FadeSlide>
        </div>
      </section>

      {/* ─── TRACKING ──────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 z-20 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <FadeSlide>
            <div className="bg-foreground/[0.03] dark:bg-foreground/[0.01] border border-foreground/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-v6-accent/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 text-center">
                <h2 className="text-4xl font-black italic tracking-tighter mb-4">TRACK YOUR PACKAGE</h2>
                <p className="opacity-40 text-sm font-bold mb-12 tracking-widest uppercase">
                  ENTER YOUR TRACKING NUMBER TO SEE WHERE IT IS
                </p>
                <form onSubmit={handleHomeTrack} className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                    <input
                      type="text"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                      placeholder="ENTER NUMBER HERE"
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
          </FadeSlide>
        </div>
      </section>

      {/* ─── MARQUEE 3 ─────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <MarqueeStrip text="JOIN THE SYNDICATE — REQUEST ACCESS — SECURE ENCRYPTED CHANNEL — VAULT NETWORK" />
      </div>

      {/* ─── SYNDICATE ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center z-10 px-6 py-32">
        <FadeSlide className="text-center bg-v6-accent/5 backdrop-blur-3xl p-16 md:p-32 rounded-[5rem] border border-v6-accent/20 shadow-2xl relative overflow-hidden max-w-5xl w-full">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-v6-accent/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="relative z-10">
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-[10px] bg-v6-accent text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-8"
            >
              Secured Connection
            </motion.span>

            <h2 className="text-5xl md:text-[8rem] font-black mb-12 tracking-tighter uppercase italic leading-none">
              <SplitWords text="JOIN THE" delay={0.05} />
              <br />
              <span className="v6-accent-text">
                <SplitWords text="SYNDICATE." delay={0.25} />
              </span>
            </h2>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSyndicateSubmit}
              className="flex flex-col md:flex-row gap-4 mb-20 max-w-2xl mx-auto"
            >
              <input
                type="email"
                required
                placeholder="YOUR ENCRYPTED EMAIL"
                className="bg-background/40 border-2 border-foreground/10 rounded-3xl py-6 px-12 focus:outline-none focus:border-v6-accent w-full md:w-[450px] font-black text-sm tracking-widest text-center"
              />
              <button
                type="submit"
                onMouseEnter={playHoverSound}
                className="bg-v6-accent text-white px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-v6-accent/40"
              >
                REQUEST ACCESS
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.3 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="flex justify-center gap-16 text-[10px] font-black tracking-[0.5em]"
            >
              <a href="#" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-all italic">INSTAGRAM</a>
              <a href="#" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-all italic">TWITTER</a>
              <a href="#" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-all italic">DISCORD</a>
            </motion.div>
          </div>
        </FadeSlide>

        <div className="absolute bottom-8 left-0 w-full px-12 flex justify-between text-[10px] font-black opacity-20 tracking-widest">
          <span>© 2026 VAULT 6 STUDIOS</span>
          <span>SYNDICATE NETWORK OPERATIONAL</span>
        </div>
      </section>

      <Footer />
    </main>
  );
}
