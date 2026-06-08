"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Box, Layers, Cpu, ShieldAlert, Wifi, ArrowRight, CheckCircle2, Terminal } from "lucide-react";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";

export default function KitsPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    playClickSound();
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      playSuccessSound();
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <Header />

      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[radial-gradient(circle,var(--v6-accent),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          
          {/* Left Side: Hype & Intel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Coming Soon</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">3D VAULT<br/>KITS<span className="text-orange-500">.</span></h1>
              <p className="opacity-60 text-lg leading-relaxed font-medium max-w-lg">
                The next evolution of the archive. High-fidelity 3D assets, custom head-sculpts, and modular kitbash parts — verified and ready for physical prototyping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[
                 { label: "ASSET_TYPE", value: "HIGH_POLY_STLs", icon: <Box size={16} /> },
                 { label: "TOPOLOGY", value: "PRINT_OPTIMIZED", icon: <Layers size={16} /> },
                 { label: "AUTH_LINK", value: "DIRECT_DOWNLOAD", icon: <Wifi size={16} /> },
                 { label: "SECURITY", value: "OMNI_ENCRYPTED", icon: <Lock size={16} /> },
               ].map(item => (
                 <div key={item.label} className="bg-foreground/[0.02] border border-foreground/5 p-6 rounded-2xl flex items-center gap-4 group hover:bg-foreground/[0.04] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                       {item.icon}
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-[7px] font-black opacity-30 uppercase tracking-widest">{item.label}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest">{item.value}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex items-center gap-6 p-8 border border-orange-500/10 bg-orange-500/5 rounded-[2.5rem] opacity-40">
               <ShieldAlert size={24} className="text-orange-500 shrink-0" />
               <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                  Members only. Launching Q3 2026.
               </p>
            </div>
          </motion.div>

          {/* Right Side: Terminal / Request Access */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="bg-foreground text-background rounded-[3.5rem] p-10 md:p-16 space-y-10 shadow-2xl relative overflow-hidden group">
               {/* Static Scanline Animation */}
               <motion.div 
                 animate={{ top: ["-10%", "110%"] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-px bg-background/20 z-10"
               />

               <div className="space-y-2 relative z-20">
                  <div className="flex justify-between items-start">
                     <Terminal size={24} className="text-orange-500 mb-4" />
                     <div className="text-right font-mono text-[8px] opacity-30 uppercase tracking-widest">
                        Node: VAULT_06_BETA<br/>
                        Status: ENCRYPTED
                     </div>
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-background">Request Access<span className="text-orange-500">.</span></h2>
                  <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">Get early access when we launch</p>
               </div>

               <div className="relative z-20">
                  <AnimatePresence mode="wait">
                    {!isSubscribed ? (
                      <motion.form 
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleNotify} 
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                           <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Your Email</label>
                           <input 
                             required
                             type="email" 
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                             placeholder="your@email.com"
                             className="w-full bg-background/5 border border-background/10 rounded-2xl py-6 px-8 font-black tracking-widest focus:border-orange-500 focus:outline-none uppercase transition-all"
                           />
                        </div>
                        <button 
                          disabled={isSubmitting}
                          onMouseEnter={playHoverSound}
                          className="w-full bg-orange-500 text-white rounded-2xl py-6 font-black text-xs uppercase tracking-[0.6em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-4"
                        >
                          {isSubmitting ? (
                            <><Cpu size={18} className="animate-spin" /> SUBMITTING...</>
                          ) : (
                            <>NOTIFY ME <ArrowRight size={18} /></>
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10 space-y-6"
                      >
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                           <CheckCircle2 size={32} className="text-green-500" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-black italic uppercase tracking-tighter">You&apos;re on the list!</h3>
                           <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                              We&apos;ll email you when the kits are ready to launch.
                           </p>
                        </div>
                        <button 
                           onClick={() => setIsSubscribed(false)}
                           className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-opacity"
                        >
                           ← Sign up another email
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Decorative Terminal UI */}
               <div className="relative z-20 pt-10 mt-10 border-t border-background/10 font-mono text-[7px] uppercase tracking-widest opacity-20 space-y-1">
                  <div>&gt; initialize_secure_handshake... ok</div>
                  <div>&gt; mapping_3d_topology... 84%</div>
                  <div>&gt; decrypting_mesh_data... stable</div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* 3D Blueprint Placeholder Grid */}
        <div className="mt-32 space-y-12">
           <div className="text-center space-y-2">
              <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.5em] block">3D Asset Preview</span>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Blueprint Gallery<span className="v6-accent-text">.</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-video bg-foreground/[0.02] border border-foreground/5 rounded-[2.5rem] relative overflow-hidden group">
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                   <div className="absolute inset-0 flex items-center justify-center grayscale opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700">
                      <Box size={64} />
                   </div>
                   <div className="absolute bottom-6 left-8 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">MESH_DATA_LOCKED</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
