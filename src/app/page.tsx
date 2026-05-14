"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ImageSequenceViewer } from "@/components/image-sequence-viewer";
import { motion, useScroll, useTransform, useSpring, motionValue } from "framer-motion";
import { ShieldCheck, Activity, Cpu, ArrowRight, Search, ShoppingBag } from "lucide-react";
import type { FrameAdjustment } from "@/components/image-sequence-viewer";
import { useSettings } from "@/components/settings-provider";
import { useCart } from "@/components/cart-provider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { addToCart } = useCart();
  const router = useRouter();
  const [trackId, setTrackId] = useState("");
  const figurineFrames = Array.from({ length: 25 }, (_, i) => `/frames/${(i + 1).toString().padStart(2, '0')}.png`);
  
  const handleHomeTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId) {
      router.push(`/tracking?id=${trackId}`);
    }
  };
  const { settings } = useSettings();

  // USER: Adjust these per frame if zoom is inconsistent
  const frameAdjustments: FrameAdjustment[] = [
    { scale: 1.0 }, // 01
    { scale: 1.0 }, // 02
    { scale: 1.0 }, // 03
    { scale: 1.0 }, // 04
    { scale: 1.0 }, // 05
    { scale: 1.0 }, // 06
    { scale: 1.0 }, // 07
    { scale: 1.0 }, // 08
    { scale: 1.0 }, // 09
    { scale: 1.0 }, // 10
    { scale: 1.0 }, // 11
    { scale: 1.0 }, // 12
    { scale: 1.0 }, // 13
    { scale: 1.0 }, // 14
    { scale: 1.0 }, // 15
    { scale: 1.0 }, // 16
    { scale: 1.0 }, // 17
    { scale: 1.0 }, // 18
    { scale: 1.0 }, // 19
    { scale: 1.0 }, // 20
    { scale: 1.0 }, // 21
    { scale: 1.0 }, // 22
    { scale: 1.0 }, // 23
    { scale: 1.0 }, // 24
    { scale: 1.0 }, // 25
  ];

  const { scrollYProgress } = useScroll();
  const [frameIndex, setFrameIndex] = useState(0);
  
  const springConfig = { damping: 40, stiffness: 200 };
  const smoothScroll = useSpring(scrollYProgress, { damping: 80, stiffness: 50 });

  const time = motionValue(0);
  useEffect(() => {
    let raf: number;
    const update = (t: number) => {
      time.set(t);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [time]);

  const idleRotation = useTransform(time, [0, 20000], [0, 1], { clamp: false });
  const isScrolling = useTransform(smoothScroll, [0, 0.01], [0, 1]);
  
  const combinedProgress = useTransform(
    [smoothScroll, idleRotation, isScrolling],
    ([scroll, idle, scrolling]) => {
      return (scrolling as number) > 0.5 ? (scroll as number) : (idle as number) % 1;
    }
  );

  const currentIndex = useTransform(combinedProgress, (v) => 
    Math.min(Math.floor((v as number) * figurineFrames.length), figurineFrames.length - 1)
  );

  useEffect(() => {
    return currentIndex.on("change", (v) => setFrameIndex(v));
  }, [currentIndex]);

  const x = useSpring(useTransform(scrollYProgress, [0, 0.4, 0.7, 1], ["0%", "22%", "-22%", "0%"]), springConfig);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 0.9]), springConfig);

  return (
    <main id="main-container" className="relative w-full bg-background overflow-x-hidden text-foreground font-sans selection:bg-v6-accent selection:text-white transition-colors duration-500">
      <Header />
      
      <div className="fixed inset-0 z-0 bg-background">
        <ImageSequenceViewer 
          imageUrls={figurineFrames} 
          currentIndex={frameIndex}
          fusionUrls={figurineFrames.slice(10, 15)}
          x={x}
          scale={scale}
          frameAdjustments={frameAdjustments}
        />
      </div>

      <section className="relative h-screen flex flex-col items-center justify-center px-6 z-10 pointer-events-none">
        <div className="text-center max-w-5xl mix-blend-exclusion">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12vw] md:text-[10vw] font-black leading-[0.8] tracking-tighter uppercase italic"
          >
            {settings.hero_title} <br />
            <span className="text-outline border-foreground/50">{settings.hero_subtitle}</span>
            <span className="v6-accent-text">.</span>
          </motion.h1>
          <p className="mt-8 opacity-60 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed">
            {settings.hero_description}
          </p>
          <div className="flex flex-col items-center justify-center gap-6 mt-12 pointer-events-auto">
            <button className="group relative bg-foreground text-background px-12 py-6 font-black text-xs uppercase tracking-[0.4em] flex items-center gap-4 hover:bg-v6-accent hover:text-white transition-all overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-v6-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
               <span className="relative z-10 font-black">Enter Vault</span>
               <ArrowRight className="relative z-10 group-hover:translate-x-2 transition-transform" size={18} />
            </button>
            <a href="#" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:text-v6-accent transition-all border-b border-transparent hover:border-v6-accent pb-1">
              Browse the Archive
            </a>
          </div>
        </div>
      </section>

      <section className="relative h-screen flex items-center px-6 md:px-24 z-10">
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 bg-foreground/5 backdrop-blur-xl p-12 md:p-20 rounded-[3rem] border border-foreground/10 shadow-2xl">
          <div>
            <span className="v6-accent-text font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Vault Standards</span>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-8">OUR <br />ETHOS.</h2>
            <p className="opacity-60 text-lg leading-relaxed font-medium">Uncompromising standards. Every piece is hand-selected and multi-stage verified.</p>
          </div>
          <div className="space-y-12">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-v6-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-v6-accent transition-colors">
                <Activity className="v6-accent-text group-hover:text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black italic mb-2">CURATION</h3>
                <p className="opacity-50 text-sm">If it isn&apos;t S-tier, it doesn&apos;t enter the Vault.</p>
              </div>
            </div>
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-v6-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-v6-accent transition-colors">
                <ShieldCheck className="v6-accent-text group-hover:text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black italic mb-2">AUTHENTICITY</h3>
                <p className="opacity-50 text-sm">Direct sourcing and multi-stage verification.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 z-20 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="bg-foreground/[0.03] dark:bg-foreground/[0.01] border border-foreground/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-v6-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
             <div className="relative z-10 text-center">
                <h2 className="text-4xl font-black italic tracking-tighter mb-4">TRACK YOUR PACKAGE</h2>
                <p className="opacity-40 text-sm font-bold mb-12 tracking-widest uppercase">ENTER YOUR TRACKING NUMBER TO SEE WHERE IT IS</p>
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
                  <button type="submit" className="bg-v6-accent text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all">
                    Track Now
                  </button>
                </form>
             </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen py-32 px-6 md:px-24 z-20">
        <div className="bg-foreground/[0.02] backdrop-blur-3xl p-12 md:p-24 rounded-[4rem] shadow-2xl border border-foreground/5">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24">
            <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter italic">THE VAULT.</h2>
            <p className="v6-accent-text max-w-xs mt-4 md:mt-0 font-black tracking-widest uppercase text-[10px]">
              LIMITED STUDIO QUANTITIES
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { name: "Krypton Legacy", price: "$35", type: "Head Sculpt" },
              { name: "Detective Samurai", price: "$38", type: "Head Sculpt" },
              { name: "Jeet Kune Do Master", price: "Sold Out", type: "Full Custom" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -15, scale: 1.02 }}
                className="group border border-foreground/5 p-12 flex flex-col aspect-square justify-between hover:bg-foreground/5 transition-all duration-500 rounded-[2.5rem] bg-background/40"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">{item.type}</span>
                  <span className="text-sm font-mono font-black bg-foreground text-background px-4 py-1 rounded-full">{item.price}</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                   <div className="w-40 h-40 rounded-full bg-v6-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">{item.name}</h3>
                  <button 
                    onClick={() => {
                      if (item.price !== 'Sold Out') {
                        addToCart({ 
                          id: `V6-HOME-${i}`, 
                          deploymentId: `V6-${item.name.toUpperCase().substring(0,3)}`, 
                          name: item.name, 
                          price: item.price 
                        });
                      }
                    }}
                    disabled={item.price === 'Sold Out'}
                    className={`mt-8 w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg ${item.price === 'Sold Out' ? 'bg-foreground/5 opacity-20 cursor-not-allowed' : 'bg-foreground text-background hover:bg-v6-accent hover:text-white'}`}
                  >
                    {item.price === 'Sold Out' ? "Secured" : "Acquire Artifact"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative h-screen flex flex-col items-center justify-center z-10 px-6">
        <div className="text-center bg-v6-accent/5 backdrop-blur-3xl p-16 md:p-32 rounded-[5rem] border border-v6-accent/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-v6-accent/10 rounded-full blur-[150px]"></div>
          <div className="relative z-10">
            <span className="inline-block text-[10px] bg-v6-accent text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest mb-8">Secured Connection</span>
            <h2 className="text-5xl md:text-[8rem] font-black mb-12 tracking-tighter uppercase italic leading-none">JOIN THE <br /><span className="v6-accent-text">SYNDICATE.</span></h2>
            <div className="flex flex-col md:flex-row gap-4 mb-20 max-w-2xl mx-auto">
              <input 
                type="email" 
                placeholder="YOUR ENCRYPTED EMAIL" 
                className="bg-background/40 border-2 border-foreground/10 rounded-3xl py-6 px-12 focus:outline-none focus:border-v6-accent w-full md:w-[450px] font-black text-sm tracking-widest text-center"
              />
              <button className="bg-v6-accent text-white px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-v6-accent/40">
                REQUEST ACCESS
              </button>
            </div>
            <div className="flex justify-center gap-16 text-[10px] font-black tracking-[0.5em] opacity-30">
              <a href="#" className="hover:opacity-100 hover:text-v6-accent transition-all italic">INSTAGRAM</a>
              <a href="#" className="hover:opacity-100 hover:text-v6-accent transition-all italic">TWITTER</a>
              <a href="#" className="hover:opacity-100 hover:text-v6-accent transition-all italic">DISCORD</a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-0 w-full px-12 flex justify-between text-[10px] font-black opacity-20 tracking-widest">
          <span>© 2026 VAULT 6 STUDIOS</span>
          <span>SYNDICATE NETWORK OPERATIONAL</span>
        </div>
      </section>
      <Footer />
    </main>
  );
}
