"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, ShoppingBag, X as CloseIcon, Volume1, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSettings } from "@/components/settings-provider";
import { useCart } from "@/components/cart-provider";
import { playHoverSound, playClickSound, playSuccessSound, getSoundMode, setSoundMode, SoundMode } from "@/lib/sound-effects";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [soundMode, setSoundModeState] = React.useState<SoundMode>("minimal");
  const { settings } = useSettings();
  const { totalItems } = useCart();

  React.useEffect(() => {
    setMounted(true);
    setSoundModeState(getSoundMode());
  }, []);

  const cycleSoundMode = () => {
    let nextMode: SoundMode = "minimal";
    if (soundMode === "minimal") nextMode = "retro";
    else if (soundMode === "retro") nextMode = "mechanical";
    else if (soundMode === "mechanical") nextMode = "muted";
    else if (soundMode === "muted") nextMode = "minimal";
    
    setSoundMode(nextMode);
    setSoundModeState(nextMode);
    
    setTimeout(() => {
      if (nextMode !== "muted") {
        playSuccessSound();
      }
    }, 50);
  };

  if (!mounted) return null;

  const navLinks = [
    { name: "TRACKING", href: "/tracking", desc: "See where your package is" },
    { name: "3D KITS", href: "/kits", desc: "Purchase your garage kits" },
    { name: "JOIN US", href: "/join", desc: "Sign up for exclusive access" },
    { name: "LOGIN", href: "/login", desc: "Access your account" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[100] pointer-events-none">
      {/* 1. Main Navigation Bar */}
      <div className="flex justify-between items-center px-6 py-6 md:px-12 pointer-events-auto">
        <Link href="/" onClick={() => { playClickSound(); setIsOpen(false); }} onMouseEnter={playHoverSound}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col z-[110] cursor-pointer hover:opacity-70 transition-opacity"
          >
            <div className="text-2xl font-black tracking-tighter text-foreground leading-none">
              {settings.hero_title} {settings.hero_subtitle}<span className="v6-accent-text">.</span>
            </div>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] v6-accent-text mt-1">
              {settings.hero_subheading}
            </span>
          </motion.div>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-6 text-foreground z-[110]">
          {/* Persistent Vault Link */}
          <Link 
            href="/collection" 
            onMouseEnter={playHoverSound}
            onClick={() => { playClickSound(); setIsOpen(false); }}
            className="flex items-center gap-2 px-6 py-3 border border-foreground/10 rounded-xl hover:bg-v6-accent hover:text-white hover:border-v6-accent transition-all group relative overflow-hidden"
          >
             <div className="absolute inset-y-0 left-0 w-1 bg-white -translate-x-full group-hover:translate-x-0 transition-transform" />
             <div className="w-1 h-1 bg-v6-accent rounded-full group-hover:bg-white animate-pulse" />
             <span className="text-[10px] font-black tracking-[0.3em] uppercase">VAULT</span>
          </Link>

          <button
            onMouseEnter={playHoverSound}
            onClick={() => { playClickSound(); setIsOpen(!isOpen); }}
            className="flex items-center gap-3 px-6 py-3 border border-foreground/10 rounded-xl hover:bg-foreground/5 transition-all group overflow-hidden relative"
          >
             <div className="absolute inset-y-0 left-0 w-1 bg-v6-accent -translate-x-full group-hover:translate-x-0 transition-transform" />
             <span className="text-[10px] font-black tracking-[0.3em] uppercase">
               {isOpen ? "CLOSE" : "MENU"}
             </span>
             <div className="flex flex-col gap-1">
               <motion.div 
                 animate={isOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                 className="w-4 h-[1.5px] bg-foreground" 
               />
               <motion.div 
                 animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                 className="w-4 h-[1.5px] bg-foreground" 
               />
               <motion.div 
                 animate={isOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                 className="w-4 h-[1.5px] bg-foreground" 
               />
             </div>
          </button>
          
          {/* Cart icon — always visible */}
          <Link
            href="/checkout"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="p-3 rounded-xl hover:bg-foreground/5 transition-all border border-transparent hover:border-foreground/10 relative"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-v6-accent text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg shadow-v6-accent/20">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onMouseEnter={playHoverSound}
              onClick={() => { playClickSound(); setTheme(theme === "dark" ? "light" : "dark"); }}
              className="p-3 rounded-xl hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/10"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Sound Mode Toggle */}
            <button
              onMouseEnter={playHoverSound}
              onClick={cycleSoundMode}
              className="hidden md:flex p-3 rounded-xl hover:bg-foreground/5 transition-all border border-transparent hover:border-foreground/10 items-center gap-2 group relative"
              aria-label="Cycle Sound Mode"
              title={`Sound Mode: ${soundMode.toUpperCase()}`}
            >
              {soundMode === "minimal" && <Volume1 size={18} className="text-foreground" />}
              {soundMode === "retro" && <Volume2 size={18} className="text-v6-accent animate-pulse" />}
              {soundMode === "mechanical" && <Volume2 size={18} className="text-yellow-500" />}
              {soundMode === "muted" && <VolumeX size={18} className="opacity-40" />}
              <span className="hidden xl:inline text-[7px] font-black tracking-widest uppercase opacity-45 group-hover:opacity-100 transition-opacity">
                {soundMode}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Full-Screen Tech Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-background/95 backdrop-blur-2xl pointer-events-auto flex flex-col items-center justify-center p-6 z-[105]"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--v6-glow),transparent_70%)]" />
               <div className="absolute inset-0 border-[10vw] border-foreground/[0.02]" />
               <motion.div 
                 animate={{ top: ["-10%", "110%"] }}
                 transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 w-full h-px bg-v6-accent/30 shadow-[0_0_20px_var(--v6-glow)]"
               />
            </div>

            <nav className="relative z-10 w-full max-w-4xl space-y-8 md:space-y-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.15 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="group relative"
                >
                  <Link 
                    href={link.href} 
                    onMouseEnter={playHoverSound}
                    onClick={() => { playClickSound(); setIsOpen(false); }}
                    className="flex flex-col md:flex-row md:items-end gap-2 md:gap-8 hover:v6-accent-text transition-colors relative"
                  >
                    <span className="text-[10px] font-black v6-accent-text opacity-50 font-mono tracking-widest">
                      0{i + 1}
                    </span>
                    <h2 className="text-4xl md:text-8xl font-black italic uppercase leading-none tracking-tighter group-hover:translate-x-6 transition-transform duration-700 flex items-center gap-4">
                      {link.name}
                      {link.name === "3D KITS" && (
                        <span className="text-[10px] md:text-sm font-black bg-orange-500 text-white px-3 py-1 rounded-full not-italic tracking-widest align-middle">
                          COMING SOON
                        </span>
                      )}
                    </h2>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-2 md:mb-4 group-hover:opacity-60 transition-opacity">
                      // {link.desc}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 flex flex-col md:flex-row justify-between items-start md:items-end z-10 gap-4">
               <div className="space-y-1 md:space-y-2">
                 <p className="text-[8px] font-black opacity-30 tracking-[0.5em] uppercase">SYSTEM PROTOCOL</p>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] v6-accent-text">V6-AUTH-ACTIVE</p>
               </div>
               <div className="flex flex-wrap gap-4 md:gap-12 text-[10px] font-black tracking-[0.3em] opacity-40">
                  <a href="#" className="hover:opacity-100 italic">INSTAGRAM</a>
                  <a href="#" className="hover:opacity-100 italic">TWITTER</a>
                  <a href="#" className="hover:opacity-100 italic">DISCORD</a>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
