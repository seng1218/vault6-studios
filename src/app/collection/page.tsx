"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpRight, ChevronDown, LayoutGrid, ShoppingBag } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { fetchArtifacts } from "@/app/actions/artifact-actions";
import { useCart } from "@/components/cart-provider";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";
import { TransmissionOverlay } from "@/components/transmission-overlay";

// Load E-Commerce preview component dynamically with SSR disabled to prevent hydration errors
const ECommercePreview = dynamic(() => import("@/components/ecommerce-preview").then(mod => mod.ECommercePreview), { ssr: false });

export default function CollectionPage() {
  const { addToCart } = useCart();
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [activeSeries, setActiveSeries] = useState("ALL_SERIES");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  
  const [transmission, setTransmission] = useState({ isVisible: false, itemName: "" });

  const seriesList = useMemo(() => {
    const unique = Array.from(new Set(artifacts.map(a => a.series).filter(Boolean)));
    return ["ALL_SERIES", ...unique.sort() as string[]];
  }, [artifacts]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchArtifacts();
        if (res?.success) setArtifacts(res.data || []);
      } catch (error) {
        console.error("Failed to fetch artifacts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredArtifacts = useMemo(() => {
    return artifacts
      .filter(a => {
        const matchesSeries = activeSeries === "ALL_SERIES" || a.series === activeSeries;
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             a.deploymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (a.series && a.series.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSeries && matchesSearch;
      })
      .sort((a, b) => {
        // Sort by series first, then by name
        const seriesA = (a.series || "").toUpperCase();
        const seriesB = (b.series || "").toUpperCase();
        if (seriesA !== seriesB) return seriesA.localeCompare(seriesB);
        return a.name.localeCompare(b.name);
      });
  }, [artifacts, activeSeries, searchQuery]);

  const handleAcquire = (item: any) => {
    if (item.status !== 'SOLD OUT') {
      playSuccessSound();
      addToCart(item);
      setTransmission({ isVisible: true, itemName: item.name });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <Header />
      
      <TransmissionOverlay 
        isVisible={transmission.isVisible} 
        itemName={transmission.itemName} 
        onComplete={() => setTransmission({ ...transmission, isVisible: false })} 
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-12"
          >
            <div className="w-full max-w-xs space-y-6">
              <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase text-v6-accent">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-3 h-3 border border-v6-accent border-t-transparent rounded-full"
                  />
                  <span>Loading</span>
                </div>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Please wait...
                </motion.span>
              </div>
              <div className="h-[1px] w-full bg-foreground/5 relative overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-v6-accent shadow-[0_0_15px_var(--v6-glow)] w-1/3" 
                />
              </div>
              <div className="font-mono text-[8px] opacity-20 uppercase flex flex-col gap-1 text-center">
                <span>Fetching collection...</span>
                <span>Almost ready</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.main 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* 1. Cinematic Background */}
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.06, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none dark:opacity-[0.03]"
            >
                <h1 className="text-[20vw] font-black leading-[0.7] uppercase tracking-tighter">VAULT</h1>
                <h1 className="text-[25vw] font-black leading-[0.7] uppercase text-outline">SERIES</h1>
            </motion.div>

            <div className="relative z-10 pt-48 pb-32 px-6 md:px-12 max-w-[1600px] mx-auto">
              {/* 2. Header, Search & Series Dropdown */}
              <div className="space-y-16 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <span className="text-[10px] font-black v6-accent-text uppercase tracking-[0.5em] block">Physical Inventory</span>
                    <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">THE SERIES<span className="v6-accent-text">.</span></h2>
                    <h3 className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] max-w-sm">Authentic Anime Figures & Waifu Collectibles secured for the Malaysian Market.</h3>
                  </motion.div>

                  {/* Styled Dropdown */}
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative w-full md:w-80 z-[50]"
                  >
                    <span className="text-[8px] font-black opacity-30 tracking-[0.4em] uppercase block mb-3">Filter by Series</span>
                    <button
                      onClick={() => {
                        playClickSound();
                        setIsDropdownOpen(!isDropdownOpen);
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full flex items-center justify-between bg-foreground/5 border border-foreground/10 rounded-2xl p-5 hover:border-v6-accent transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-v6-accent/10 flex items-center justify-center">
                            <LayoutGrid size={14} className="v6-accent-text" />
                        </div>
                        <div className="text-left">
                            <p className="text-[7px] font-black opacity-30 uppercase tracking-widest leading-none mb-1">Active Series</p>
                            <p className="text-[11px] font-black uppercase tracking-widest">{activeSeries.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ChevronDown size={16} className="opacity-30 group-hover:opacity-100 group-hover:text-v6-accent transition-all" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-full left-0 w-full mt-3 bg-background/80 backdrop-blur-2xl border border-foreground/10 rounded-2xl overflow-hidden shadow-2xl z-[60]"
                        >
                          <div className="p-2 space-y-1">
                            {seriesList.map((series) => (
                              <button
                                key={series}
                                onClick={() => {
                                  playClickSound();
                                  setActiveSeries(series);
                                  setIsDropdownOpen(false);
                                }}
                                onMouseEnter={playHoverSound}
                                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  activeSeries === series 
                                    ? "bg-v6-accent text-white" 
                                    : "hover:bg-foreground/5 opacity-60 hover:opacity-100"
                                }`}
                              >
                                <span>{series.replace('_', ' ')}</span>
                                {activeSeries === series && <div className="w-1 h-1 rounded-full bg-white animate-pulse" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Search Engine */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative max-w-2xl group"
                >
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-v6-accent transition-all" size={20} />
                  <input
                      type="text"
                      aria-label="Search artifacts by name or deployment ID"
                      placeholder="SEARCH BY NAME OR ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl py-6 pl-16 pr-6 text-[10px] font-black tracking-[0.2em] focus:outline-none focus:border-v6-accent focus:ring-2 focus:ring-v6-accent/40 focus:bg-foreground/[0.05] transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-20">
                      <span className="text-[8px] font-black uppercase tracking-widest">Index: Live</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-v6-accent" />
                  </div>
                </motion.div>
              </div>

              {/* 3. Uniform Artifact Grid - High Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {filteredArtifacts.map((item, i) => {
                  const isUrgent = item.status === "LIMITED" || item.status === "SOLD OUT";
                  const accentClass = isUrgent ? "text-amber-500" : "v6-accent-text";
                  const bgAccentClass = isUrgent ? "bg-amber-500" : "bg-v6-accent";
                  const laserColor = isUrgent ? "#fbbf24" : "var(--v6-accent)";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.05 }}
                      transition={{
                        duration: 0.4,
                        delay: i * 0.04,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className={`group relative v6-surface-sm border border-foreground/10 rounded-[2.5rem] p-8 flex flex-col min-h-[500px] hover:bg-[var(--v6-surface)] transition-all duration-500 overflow-hidden transform-gpu perspective-1000 ${isUrgent ? "hover:border-amber-500/30" : "hover:border-v6-accent/30"}`}
                      onMouseEnter={() => {
                        setHoveredCardIndex(i);
                        playHoverSound();
                      }}
                      onMouseLeave={() => {
                        setHoveredCardIndex(null);
                      }}
                    >
                      {/* Card Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${isUrgent ? 'from-amber-500/5' : 'from-v6-accent/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      {/* Laser Scan Animation */}
                      <motion.div
                        initial={{ top: "-10%" }}
                        whileHover={{ top: "110%" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                        style={{ backgroundColor: laserColor, boxShadow: `0 0 15px ${laserColor}` }}
                        className="absolute left-0 right-0 h-px z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                      />

                      {/* Top Meta */}
                      <div className="space-y-2 relative z-10">
                        <p className={`text-[10px] font-black opacity-50 font-mono tracking-widest uppercase ${accentClass}`}>{item.deploymentId}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase ${isUrgent ? 'bg-amber-500/10 text-amber-500' : 'bg-v6-accent/10 v6-accent-text'}`}>{item.series}</span>
                          <span className="inline-block text-[8px] font-black px-2 py-0.5 rounded-md bg-foreground/10 opacity-60 tracking-wider uppercase">{item.scale} / {item.material}</span>
                        </div>
                      </div>

                      {/* Elegant E-Commerce Product Image Preview */}
                      <Link
                        href={`/collection/${item.id}`}
                        onMouseEnter={playHoverSound}
                        onClick={playClickSound}
                        className="w-full h-64 relative z-10 my-8 block shrink-0"
                      >
                        <ECommercePreview item={item} />
                      </Link>

                      {/* Info - Pushed to bottom with mt-auto for alignment */}
                      <div className="space-y-6 relative z-10 mt-auto">
                        <div className="flex justify-between items-start gap-4">
                          <Link
                            href={`/collection/${item.id}`}
                            onMouseEnter={playHoverSound}
                            onClick={playClickSound}
                            className="flex-1 min-w-0"
                          >
                            <span className="text-[8px] font-black opacity-30 tracking-[0.4em] uppercase block mb-1">{item.category}</span>
                            <h3 className={`text-2xl font-black uppercase italic tracking-tighter leading-tight transition-colors ${isUrgent ? 'group-hover:text-amber-500' : 'group-hover:text-[var(--v6-accent)]'}`}>{item.name}</h3>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcquire(item);
                            }}
                            onMouseEnter={playHoverSound}
                            disabled={item.status === 'SOLD OUT'}
                            aria-label={item.status === 'SOLD OUT' ? `${item.name} — sold out` : `Add ${item.name} to cart`}
                            className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all cursor-pointer ${item.status === 'SOLD OUT' ? "bg-foreground/5 opacity-20 cursor-not-allowed" : `${bgAccentClass} text-white hover:opacity-90 active:scale-95 shadow-lg ${isUrgent ? 'shadow-amber-500/20' : 'shadow-v6-accent/20'}`}`}
                          >
                            <ShoppingBag size={20} />
                          </button>
                        </div>

                        <div className="flex justify-between items-end border-t border-foreground/5 pt-6">
                          <div className="space-y-1.5">
                            <p className="text-[8px] font-black opacity-30 tracking-[0.3em] uppercase">Item Cost</p>
                            <p className="text-xl font-black italic">{item.price?.trim() || "—"}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right space-y-1">
                              <p className="text-[8px] font-black opacity-30 tracking-[0.3em] uppercase">Stock Status</p>
                              <p className={`text-[10px] font-black tracking-widest ${item.status === 'SOLD OUT' ? "opacity-30 line-through" : accentClass}`}>{item.status}</p>
                            </div>
                            <Link
                              href={`/collection/${item.id}`}
                              onMouseEnter={playHoverSound}
                              onClick={playClickSound}
                              className={`w-12 h-12 rounded-2xl border border-foreground/10 flex items-center justify-center transition-all ${isUrgent ? 'hover:bg-amber-500 hover:border-amber-500' : 'hover:bg-v6-accent hover:border-v6-accent'} hover:text-white`}
                            >
                              <ArrowUpRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredArtifacts.length === 0 && !loading && (
                <div className="text-center py-40 space-y-4">
                  <h3 className="text-2xl font-black italic opacity-60 uppercase tracking-widest">No Figures Match Query</h3>
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.5em]">No results found — try a different search or series</p>
                </div>
              )}
            </div>
            <Footer />
          </motion.main>
        )}
      </AnimatePresence>
    </main>
  );
}
