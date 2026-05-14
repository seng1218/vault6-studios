"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Search, ShieldAlert, Cpu, Globe, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";

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
    setIsSearching(true);
    setHasResult(false);
    setTimeout(() => {
      setIsSearching(false);
      setHasResult(true);
    }, 2000);
  };

  const trackingLinks = [
    { name: "17TRACK", url: `https://www.17track.net/en/track?nums=${deploymentId}`, icon: <Globe size={18} /> },
    { name: "AFTERSHIP", url: `https://www.aftership.com/track/${deploymentId}`, icon: <Zap size={18} /> },
    { name: "PARCEL MONITOR", url: `https://www.parcelmonitor.com/track-it-online/?tracking_number=${deploymentId}`, icon: <Cpu size={18} /> },
  ];

  return (
    <div className="relative z-10 w-full max-w-2xl px-6 pt-48 pb-32">
      <div className="bg-foreground/[0.03] dark:bg-foreground/[0.01] border border-foreground/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-v6-accent/10 border border-v6-accent/20">
              <div className="w-2 h-2 rounded-full bg-v6-accent animate-pulse" />
              <span className="text-[8px] font-black v6-accent-text uppercase tracking-widest">Interactive Tracking System</span>
           </div>
           <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">TRACK YOUR ORDER<span className="v6-accent-text">.</span></h2>
           <p className="opacity-40 text-xs font-black uppercase tracking-[0.3em]">Enter your tracking number below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleTrack} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 opacity-20" size={24} />
            <input 
              type="text" 
              value={deploymentId}
              onChange={(e) => setDeploymentId(e.target.value.toUpperCase())}
              placeholder="PASTE TRACKING NUMBER HERE"
              className="w-full bg-background/50 border-2 border-foreground/10 rounded-3xl py-8 pl-20 pr-8 text-xl font-black tracking-widest placeholder:opacity-20 focus:outline-none focus:border-v6-accent transition-all uppercase"
            />
          </div>

          <button 
            type="submit"
            disabled={isSearching}
            className="w-full bg-v6-accent text-white rounded-3xl py-8 font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-v6-accent/30 disabled:opacity-50 disabled:scale-100"
          >
            {isSearching ? "SEARCHING..." : "TRACK MY PACKAGE"}
          </button>
        </form>

        {/* Results Section */}
        {hasResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6 border-t border-foreground/5"
          >
            <div className="text-center mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Click a site below to see details:</span>
            </div>
            
            <div className="grid gap-4">
              {trackingLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-6 bg-foreground/5 border border-foreground/10 rounded-2xl group hover:bg-v6-accent hover:border-v6-accent transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-v6-accent/10 rounded-xl group-hover:bg-white/20 transition-colors">
                      {link.icon}
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                      CHECK ON {link.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-black opacity-30 group-hover:text-white/60 group-hover:opacity-100 uppercase tracking-widest">
                    GO TO SITE
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Shipping Status Guide */}
        <div className="bg-foreground/[0.03] dark:bg-foreground/[0.01] border border-foreground/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl mt-8">
          <div className="mb-8 border-b border-foreground/5 pb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] v6-accent-text">What your status means</h3>
            <p className="text-[8px] font-black opacity-30 uppercase mt-1">A simple guide to your delivery progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { status: "ORDER PROCESSED", desc: "We've received your order and are getting it ready for the courier." },
              { status: "IN TRANSIT", desc: "Your package is on its way and moving through the delivery network." },
              { status: "OUT FOR DELIVERY", desc: "The courier has your package and will try to deliver it today." },
              { status: "DELIVERED", desc: "Your package has been successfully dropped off at your address." },
            ].map((item, i) => (
              <div key={item.status} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border border-v6-accent/30 flex items-center justify-center text-[8px] font-black v6-accent-text group-hover:bg-v6-accent group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-px flex-1 bg-foreground/10 my-1" />}
                </div>
                <div className="space-y-1 pb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest">{item.status}</h4>
                  <p className="text-[10px] opacity-40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Notice */}
        <div className="mt-12 flex items-center justify-center gap-4 opacity-20 grayscale">
           <ShieldAlert size={16} />
           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Need help? Contact our support team.</p>
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
