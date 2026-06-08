"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, Cpu, Globe, Zap, ArrowUpRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";

function TrackingContent() {
  const searchParams = useSearchParams();
  const [deploymentId, setDeploymentId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setDeploymentId(id.toUpperCase());
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        setHasResult(true);
      }, 1500);
    }
  }, [searchParams]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deploymentId) return;
    playClickSound();
    setIsSearching(true);
    setHasResult(false);
    setTimeout(() => {
      setIsSearching(false);
      setHasResult(true);
      playSuccessSound();
    }, 2000);
  };

  const trackingLinks = [
    { name: "VAULT_6_INTEL", url: `https://www.17track.net/en/track?nums=${deploymentId}`, icon: <Globe size={18} /> },
    { name: "CARGO_NETWORK", url: `https://www.aftership.com/track/${deploymentId}`, icon: <Zap size={18} /> },
    { name: "SECURE_SCAN", url: `https://www.parcelmonitor.com/track-it-online/?tracking_number=${deploymentId}`, icon: <Cpu size={18} /> },
  ];

  return (
    <div className="relative z-10 w-full max-w-4xl px-6 pt-48 pb-32">
      <div className="v6-surface border border-foreground/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-foreground/5 pb-12">
           <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-v6-accent/10 border border-v6-accent/20">
                 <div className="w-2 h-2 rounded-full bg-v6-accent animate-pulse" />
                 <span className="text-[8px] font-black v6-accent-text uppercase tracking-widest">Global Logistics Interface</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">PACKAGE TRACKING<span className="v6-accent-text">.</span></h2>
              <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">Query the vault deployment database</p>
           </div>
           
           <div className="hidden md:block text-right space-y-1 font-mono text-[8px] opacity-20 uppercase tracking-widest">
              <div>SYS_TIME: {new Date().toLocaleTimeString()}</div>
              <div>LOC: TOKYO_CENTRAL_HUB</div>
              <div>AUTH: V6_GUEST_ACCESS</div>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleTrack} className="space-y-6 max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-v6-accent/5 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-v6-accent transition-all" size={24} />
            <input 
              type="text" 
              value={deploymentId}
              onChange={(e) => setDeploymentId(e.target.value.toUpperCase())}
              placeholder="ENTER TRACKING_ID OR DEPLOY_CODE"
              className="relative w-full bg-background/50 border-2 border-foreground/10 rounded-3xl py-10 pl-20 pr-8 text-xl md:text-2xl font-black tracking-[0.2em] placeholder:opacity-10 focus:outline-none focus:border-v6-accent transition-all uppercase"
            />
            {isSearching && (
              <motion.div 
                animate={{ width: ["0%", "100%", "0%"], left: ["0%", "0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 h-1 bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-10"
              />
            )}
          </div>

          <button 
            type="submit"
            disabled={isSearching}
            onMouseEnter={playHoverSound}
            className="w-full bg-foreground text-background rounded-3xl py-8 font-black text-xs uppercase tracking-[0.6em] hover:bg-v6-accent hover:text-white hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 disabled:scale-100"
          >
            {isSearching ? "SCANNING_SATELLITE_NETWORK..." : "INITIATE TRACKING SEQUENCE"}
          </button>
        </form>

        {/* Results Section */}
        <AnimatePresence>
          {hasResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 pt-12 border-t border-foreground/5"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Mock Visual Data */}
                 <div className="lg:col-span-2 space-y-6">
                    <div className="v6-surface border border-foreground/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-[0.03] font-mono text-[80px] leading-none select-none">SCAN</div>
                       <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">LOGISTICS_MANIFEST</h3>
                       
                       <div className="space-y-6">
                          {[
                             { label: "MANIFEST_ID", value: deploymentId },
                             { label: "DEPARTURE_HUB", value: "TOKYO_VAULT_06" },
                             { label: "CARRIER_PROTOCOL", value: "GLOBAL_EXPRESS_AIR" },
                             { label: "SECURE_PACKAGING", value: "VERIFIED_OK" },
                          ].map(item => (
                             <div key={item.label} className="flex justify-between items-end border-b border-foreground/5 pb-2 group">
                                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest group-hover:text-v6-accent transition-colors">{item.label}</span>
                                <span className="text-[10px] font-black tracking-widest uppercase">{item.value}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* External Portal Links */}
                 <div className="space-y-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 ml-4">Authorized Portals</span>
                    <div className="grid gap-3">
                      {trackingLinks.map((link) => (
                        <a 
                          key={link.name}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={playClickSound}
                          onMouseEnter={playHoverSound}
                          className="flex items-center justify-between p-6 v6-surface border border-foreground/10 rounded-2xl group hover:border-v6-accent/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-v6-accent/5 rounded-xl group-hover:bg-v6-accent transition-colors text-v6-accent group-hover:text-white">
                              {link.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {link.name}
                            </span>
                          </div>
                          <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                        </a>
                      ))}
                    </div>
                 </div>
              </div>

              {/* Secure Logistics Map Mock */}
              <div className="bg-v6-accent/5 border border-v6-accent/10 rounded-[2.5rem] p-10 h-40 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,var(--v6-accent)_1px,transparent_1px),linear-gradient(to_bottom,var(--v6-accent)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
                 <Globe className="text-v6-accent animate-spin-slow" size={32} />
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Satellite Link established</h4>
                    <p className="text-[8px] opacity-40 uppercase tracking-[0.3em]">Mapping secure trajectory from Tokyo Vault</p>
                 </div>
                 {/* Scanning Line */}
                 <motion.div 
                    animate={{ left: ["-10%", "110%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-px bg-v6-accent/20 shadow-[0_0_20px_var(--v6-accent)]"
                 />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logistics Lifecycle Guide */}
        <div className="space-y-8 pt-12">
          <div className="text-center md:text-left border-b border-foreground/5 pb-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">LOGISTICS_LIFECYCLE</h3>
            <p className="text-[8px] font-black opacity-30 uppercase mt-1 tracking-widest">Standard operating procedure for physical secure deployments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { status: "VAULT_EXTRACTION", desc: "Item retrieved from climate-controlled high-security vault." },
              { status: "SECURE_DEPLOYMENT", desc: "Multi-layer protective casing applied and manifest secured." },
              { status: "TRANSIT_PHASE", desc: "Global logistics handover. Moving through secure air corridors." },
              { status: "LOCAL_DELIVERY", desc: "Final verification and drop-off by authorized courier." },
            ].map((item, i) => (
              <div key={item.status} className="v6-surface-sm border border-foreground/10 p-6 rounded-2xl space-y-4 group hover:bg-[var(--v6-surface)] transition-colors">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-v6-accent/10 flex items-center justify-center text-[10px] font-black v6-accent-text group-hover:bg-v6-accent group-hover:text-white transition-colors">
                    0{i + 1}
                  </div>
                  {i < 3 && <div className="h-px w-8 bg-foreground/10" />}
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest leading-tight">{item.status}</h4>
                  <p className="text-[9px] opacity-40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Notice */}
        <div className="mt-12 pt-12 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
           <div className="flex items-center gap-4">
              <ShieldAlert size={16} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Deployment issues? contact logistics command.</p>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[8px] font-mono">STATUS: UPLINK_OK</span>
              <span className="text-[8px] font-mono text-v6-accent">ENCRYPTION: AES_256</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden flex flex-col items-center">
      <Header />

      {/* 1. Technical Background */}
      <div className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.06] dark:opacity-[0.03]">
          <h1 className="text-[20vw] font-black leading-[0.7] uppercase tracking-tighter">PACKAGE</h1>
          <h1 className="text-[25vw] font-black leading-[0.7] uppercase text-outline">TRACKING</h1>
      </div>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle,var(--v6-glow),transparent_70%)]" />
        <motion.div 
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-px bg-v6-accent opacity-20 shadow-[0_0_20px_var(--v6-accent)]"
        />
      </div>

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-2xl px-6 pt-48 pb-32 flex items-center justify-center">
          <div className="text-v6-accent animate-pulse font-black tracking-widest uppercase">Initializing Interface...</div>
        </div>
      }>
        <TrackingContent />
      </Suspense>
      
      <div className="w-full">
        <Footer />
      </div>
    </main>
  );
}
