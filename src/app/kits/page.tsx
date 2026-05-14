"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Lock, Bell, Box, Layers, Zap, Cpu } from "lucide-react";

export default function KitsPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const upcomingKits = [
    { name: "2B", category: "Nier Automata", date: "Q4 2026" },
    { name: "Tifa", category: "FF VII", date: "Q1 2027" },
    { name: "Lara Croft", category: "Tomb Raider", date: "COMING SOON" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <Header />
      
      <div className="flex-1 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] border border-orange-500/20 rounded-full border-dashed"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(249,115,22,0.15),transparent_70%)] opacity-30" />
        </div>

        <div className="relative z-10 pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4"
            >
              <Zap size={14} className="text-orange-500" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">In Development</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none"
            >
              3D PRINT <br /><span className="text-orange-500">GARAGE KITS.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="opacity-60 max-w-2xl mx-auto text-lg font-medium"
            >
              3D Print Model Kits // Licensed. Pre-Printed. Yours to Build.
            </motion.p>
          </div>

          {/* Locked Kits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {upcomingKits.map((kit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="relative group border border-foreground/10 rounded-[2.5rem] p-12 bg-foreground/[0.02] overflow-hidden"
              >
                {/* Overlay Text */}
                <div className="absolute top-6 left-6 flex items-center gap-2 opacity-30">
                  <Cpu size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Protocol: {kit.category}</span>
                </div>

                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                  <div className="relative">
                    <Layers className="w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">{kit.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">EST. {kit.date}</p>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
              </motion.div>
            ))}
          </div>

          {/* Notify Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-3xl mx-auto bg-foreground/[0.03] dark:bg-foreground/[0.01] border border-foreground/10 rounded-[4rem] p-12 md:p-20 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 text-center space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-2xl mb-4">
                <Bell size={32} className="text-orange-500" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">GET EARLY ACCESS.</h2>
                <p className="opacity-60 text-sm font-medium uppercase tracking-widest">BE THE FIRST TO KNOW WHEN THE VAULT OPENS</p>
              </div>

              {subscribed ? (
                <div className="py-6 text-orange-500 font-black tracking-widest uppercase animate-pulse">
                  Transmission Received. We will notify you soon.
                </div>
              ) : (
                <form 
                  onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
                  className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"
                >
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL ADDRESS" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 bg-background/50 border border-foreground/10 rounded-2xl px-8 py-6 focus:outline-none focus:border-orange-500 font-black text-xs tracking-widest transition-all"
                  />
                  <button type="submit" className="bg-orange-500 text-white px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20">
                    Notify Me
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}