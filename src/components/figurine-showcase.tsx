"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { fetchArtifacts } from "@/app/actions/artifact-actions";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";
import { TransmissionOverlay } from "@/components/transmission-overlay";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Settings2,
  Sparkles,
  Cpu,
  CheckCircle2,
  Search,
  X as CloseIcon
} from "lucide-react";

interface Figurine {
  id: string;
  deploymentId: string;
  name: string;
  category: string;
  price: string;
  status: string;
  scale: string;
  material: string;
  series: string;
  highlights?: string;
  imageUrls?: string;
  condition?: string;
  manufacturer?: string;
  inventory?: number;
}

export function FigurineShowcase() {
  const { addToCart } = useCart();
  const [allItems, setAllItems] = useState<Figurine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isHudActive, setIsHudActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const [transmission, setTransmission] = useState({ isVisible: false, itemName: "" });
  const [listPage, setListPage] = useState(0);

  const FRAME_COUNT = 24;
  const PAGE_SIZE = 5;

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const res = await fetchArtifacts();
      if (res.success && res.data && res.data.length > 0) {
        const dbItems = res.data.map((item: any) => ({
          id: item.id,
          deploymentId: item.deploymentId || `V6-${item.name.toUpperCase().substring(0,3)}`,
          name: item.name,
          category: item.category || "COLLECTIBLE",
          price: item.price,
          status: item.status || "AVAILABLE",
          scale: item.scale || "1/6",
          material: item.material || "RESIN",
          series: item.series || "ORIGINS",
          highlights: item.highlights || "",
          imageUrls: item.imageUrls || "",
          condition: item.condition || "MISB",
          manufacturer: item.manufacturer || "Unknown",
          inventory: item.inventory || 1
        })).sort((a: any, b: any) => {
          // Sort by series first, then by name
          const sA = (a.series || "").toUpperCase();
          const sB = (b.series || "").toUpperCase();
          if (sA !== sB) return sA.localeCompare(sB);
          return a.name.localeCompare(b.name);
        });
        setAllItems(dbItems);
      } else {
        const mock = [
          { id: "V6-001", deploymentId: "V6-001", name: "Krypton Legacy", category: "HEAD SCULPT", price: "$35", status: "AVAILABLE", scale: "1/6", material: "RESIN", series: "ORIGINS" },
          { id: "V6-002", deploymentId: "V6-002", name: "Detective Samurai", category: "HEAD SCULPT", price: "$38", status: "LIMITED", scale: "1/6", material: "PRO-POLY", series: "NEO-NOIR" },
          { id: "V6-003", deploymentId: "V6-003", name: "Jeet Kune Do Master", category: "FULL CUSTOM", price: "$180", status: "SOLD OUT", scale: "1/12", material: "MIXED", series: "LEGENDS" },
          { id: "V6-004", deploymentId: "V6-004", name: "Cyber Ronin", category: "FULL CUSTOM", price: "$210", status: "PRE-ORDER", scale: "1/6", material: "VINYL", series: "NEO-NOIR" }
        ].sort((a, b) => a.series.localeCompare(b.series) || a.name.localeCompare(b.name));
        setAllItems(mock);
      }
      setLoading(false);
    };
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deploymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.series.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allItems, searchQuery]);

  const activeItem = filteredItems[selectedIdx];

  useEffect(() => {
    setListPage(Math.floor(selectedIdx / PAGE_SIZE));
  }, [selectedIdx]);

  const totalListPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const visibleStart = listPage * PAGE_SIZE;
  const visibleItems = filteredItems.slice(visibleStart, visibleStart + PAGE_SIZE);

  const images = useMemo(() => {
    if (!activeItem) return [];

    if (activeItem.imageUrls && activeItem.imageUrls.trim() !== "") {
      const customUrls = activeItem.imageUrls.split("\n").map(u => u.trim()).filter(Boolean);
      const paddedUrls = [];
      for (let i = 0; i < FRAME_COUNT; i++) paddedUrls.push(customUrls[i % customUrls.length]);
      return paddedUrls;
    }

    const name = activeItem.name.toLowerCase();
    const category = activeItem.category.toLowerCase();
    let startIndex = 1;
    if (name.includes("krypton")) startIndex = 1;
    else if (name.includes("samurai") || name.includes("detective")) startIndex = 9;
    else if (name.includes("jeet") || name.includes("master")) startIndex = 17;
    else if (name.includes("ronin") || name.includes("cyber")) startIndex = 25;
    else if (name.includes("pilot") || name.includes("tokyo")) startIndex = 33;
    else if (category.includes("vehicle") || category.includes("car") || name.includes("car")) startIndex = 41;
    else startIndex = 5;

    const frames = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const frameNum = startIndex + Math.floor(i * (53 / FRAME_COUNT));
      const normalizedNum = ((frameNum - 1) % 53) + 1;
      frames.push(`/frames/motions rem/${normalizedNum.toString().padStart(2, '0')}.jpg`);
    }
    return frames;
  }, [activeItem]);

  const productDetails = useMemo(() => {
    if (!activeItem) return { edition: "Standard Edition", features: [] };
    const isHeadSculpt = activeItem.category.toUpperCase().includes("HEAD") || activeItem.category.toUpperCase().includes("SCULPT");
    let featuresList: string[] = [];
    if (activeItem.highlights && activeItem.highlights.trim() !== "") {
      featuresList = activeItem.highlights.split("\n").map((f: string) => f.trim()).filter(Boolean);
    }
    if (isHeadSculpt) {
      return {
        edition: "Limited Release (150 Units)",
        features: featuresList.length > 0 ? featuresList : [
          "Hyper-detailed hand painted facial and hair textures",
          "Universally compatible with standard 1/6 action body frames",
          "Pre-fitted modular neck connector socket",
          "Shipped in custom secure foam lined layout case"
        ]
      };
    }
    return {
      edition: "Limited Studio Run (50 Units)",
      features: featuresList.length > 0 ? featuresList : [
        "Ultra-flexibility chassis with 30+ joint movement parameters",
        "Real fabric clothing tailored precisely to size",
        "Individually weathered scuff-detailed shoulder pads & armor",
        "Integrated base plate support stand"
      ]
    };
  }, [activeItem]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setZoomStyle({ transformOrigin: `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%` });
  };

  const handleMouseLeave = () => { setIsHovered(false); setZoomStyle({ transformOrigin: "center center" }); };
  const rotateLeft = () => { playClickSound(); setFrameIndex((p) => (p === 0 ? FRAME_COUNT - 1 : p - 1)); };
  const rotateRight = () => { playClickSound(); setFrameIndex((p) => (p === FRAME_COUNT - 1 ? 0 : p + 1)); };
  const selectFigurine = (idx: number) => { if (idx === selectedIdx) return; playClickSound(); setSelectedIdx(idx); setFrameIndex(0); };
  
  const handleDrag = (event: any, info: any) => {
    const threshold = 10;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? -1 : 1;
      setFrameIndex((prev) => {
        let next = prev + direction;
        if (next >= FRAME_COUNT) next = 0;
        if (next < 0) next = FRAME_COUNT - 1;
        return next;
      });
    }
  };

  const handleAcquire = () => {
    if (activeItem && activeItem.status !== "SOLD OUT") {
      playSuccessSound();
      addToCart({ id: activeItem.id, deploymentId: activeItem.deploymentId, name: activeItem.name, price: activeItem.price });
      setTransmission({ isVisible: true, itemName: activeItem.name });
    }
  };

  if (loading || (!activeItem && searchQuery === "")) {
    return (
      <div className="w-full h-[280px] md:h-[650px] v6-surface-xs border border-foreground/10 rounded-[2rem] flex flex-col items-center justify-center font-mono gap-4">
        <Cpu className="animate-spin text-v6-accent" size={32} />
        <span className="text-xs uppercase tracking-[0.4em] opacity-40">Accessing Physical Inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-v6-accent transition-all" size={16} />
        <input
          type="text"
          placeholder="FILTER VAULT BY NAME OR SERIES..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIdx(0);
          }}
          className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl py-4 pl-12 pr-10 text-[9px] font-black tracking-[0.2em] focus:outline-none focus:border-v6-accent focus:bg-foreground/[0.05] transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => { setSearchQuery(""); setSelectedIdx(0); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      <div className="relative w-full h-auto v6-surface-xs border border-foreground/10 rounded-[2rem] md:rounded-[3rem] p-3 md:p-10 flex flex-col lg:flex-row gap-3 md:gap-6 lg:gap-10 group overflow-hidden">
        <TransmissionOverlay 
          isVisible={transmission.isVisible} 
          itemName={transmission.itemName} 
          onComplete={() => setTransmission({ ...transmission, isVisible: false })} 
        />
        {/* Decorative neon backdrops */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-v6-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* ─── LEFT: Image Stage ─── */}
        <div className="flex-1 flex flex-col justify-between items-center relative min-h-[240px] max-h-[340px] md:max-h-none md:min-h-[380px] lg:min-h-[500px] bg-foreground/5 dark:bg-black/20 rounded-[1.25rem] md:rounded-[2.5rem] p-3 md:p-6 border border-foreground/5 overflow-hidden">

          {isHudActive && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:20px_20px] z-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 border border-dashed border-v6-accent/10 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: "25s" }} />
              <div className="absolute top-0 inset-x-0 h-px bg-v6-accent/15 shadow-[0_0_15px_var(--v6-glow)] animate-scan pointer-events-none" />
            </div>
          )}

          {/* Telemetry — abbreviated on mobile */}
          <div className="w-full flex justify-between items-start z-10 font-mono text-[7px] md:text-[9px] tracking-widest text-foreground/40 pointer-events-none select-none">
            <div>
              <div>CORE: {activeItem?.deploymentId}</div>
              <div className="hidden md:block">RENDER: ORTHOGRAPHIC_CAM</div>
              <div className="hidden md:block">SERIES: {activeItem?.series}</div>
            </div>
            <div className="text-right hidden md:block">
              <div>STAGE: OPTIMIZED_STAGE_01</div>
              <div>STATUS: SECURED_STATION</div>
            </div>
          </div>

          {/* Figurine Image */}
          <div
            ref={imageContainerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing my-1 overflow-hidden max-h-[220px] md:max-h-[320px] lg:max-h-[400px]"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0}
              onDrag={handleDrag}
              className="absolute inset-0 z-20"
            />
            
            <AnimatePresence mode="wait">
              {activeItem ? (
                <motion.img
                  key={`${activeItem.id}-${frameIndex}`}
                  src={images[frameIndex]}
                  alt={activeItem.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  style={{
                    transform: isHovered ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                    ...zoomStyle,
                  }}
                  className="max-w-[90%] max-h-[100%] object-contain v6-img-blend pointer-events-none select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-20 space-y-2">
                   <Search size={32} />
                   <span className="text-[10px] font-black uppercase tracking-widest">No Matches</span>
                </div>
              )}
            </AnimatePresence>

            {isHudActive && activeItem && (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-32 h-32 md:w-48 md:h-48 border border-v6-accent rounded-full animate-pulse" />
                <div className="absolute w-40 md:w-56 h-px bg-v6-accent" />
                <div className="absolute h-40 md:h-56 w-px bg-v6-accent" />
              </div>
            )}

            {/* Swipe drag zone — mobile only */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) rotateRight();
                else if (info.offset.x > 60) rotateLeft();
              }}
              className="absolute inset-0 z-20 md:hidden"
              style={{ touchAction: "pan-y" }}
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center md:hidden pointer-events-none">
              <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">← swipe →</span>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full flex justify-between items-center z-30">
            <div className="flex gap-1.5">
              <button onClick={rotateLeft} onMouseEnter={playHoverSound} className="p-2.5 md:p-3 rounded-xl bg-foreground/5 hover:bg-v6-accent/10 border border-foreground/10 hover:border-v6-accent/30 text-foreground transition-all active:scale-95">
                <ArrowLeft size={12} />
              </button>
              <button onClick={rotateRight} onMouseEnter={playHoverSound} className="p-2.5 md:p-3 rounded-xl bg-foreground/5 hover:bg-v6-accent/10 border border-foreground/10 hover:border-v6-accent/30 text-foreground transition-all active:scale-95">
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="text-center font-mono text-[8px] text-foreground/50 tracking-widest hidden md:block">
              ROT_AXIS_Y: {(frameIndex * (360 / FRAME_COUNT)).toFixed(1)}°
            </div>

            <button
              onClick={() => { playClickSound(); setIsHudActive(!isHudActive); }}
              onMouseEnter={playHoverSound}
              className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all ${
                isHudActive
                  ? "bg-v6-accent text-white border-v6-accent shadow-[0_0_10px_var(--v6-glow)]"
                  : "bg-foreground/5 border-foreground/10 text-foreground/40"
              }`}
            >
              HUD {isHudActive ? "ON" : "OFF"}
            </button>
          </div>

          <div className="flex gap-1 mt-2 md:mt-4 z-10 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${Math.floor(frameIndex / (FRAME_COUNT/12)) === i ? "w-4 bg-v6-accent" : "w-1 bg-foreground/10"}`} />
            ))}
          </div>
        </div>

        {/* ─── RIGHT: Info Panel ─── */}
        <div className="w-full lg:w-[420px] flex flex-col space-y-3 lg:space-y-6 z-10">

          {activeItem ? (
            <>
              {/* 1. Identity */}
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] md:text-[10px] font-black v6-accent-text tracking-[0.4em] uppercase">
                    {activeItem.series} SERIES
                  </span>
                  <span className="text-[8px] font-mono text-foreground/40 px-2 py-0.5 border border-foreground/10 rounded-md">
                    {activeItem.deploymentId}
                  </span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-foreground">
                  {activeItem.name}
                </h3>
                <p className="hidden md:block opacity-50 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                  Exclusive hand-crafted {activeItem.category.toLowerCase()} collectible. Engineered from premium {activeItem.material.toLowerCase()} and optimized for studio showcases.
                </p>
              </div>

              {/* 2. Purchase */}
              <div className="flex flex-row items-center gap-3 pt-3 border-t border-foreground/5 md:order-last">
                <div className="shrink-0">
                  <span className="text-[7px] md:text-[8px] font-black opacity-30 tracking-[0.2em] uppercase block">UNIT VALUATION</span>
                  <span className="text-xl md:text-3xl font-black italic text-foreground tracking-tighter leading-none">
                    {activeItem.price}
                  </span>
                </div>
                <button
                  onClick={handleAcquire}
                  onMouseEnter={playHoverSound}
                  disabled={activeItem.status === "SOLD OUT"}
                  className={`flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all ${
                    activeItem.status === "SOLD OUT"
                      ? "bg-foreground/5 text-foreground/20 cursor-not-allowed border border-foreground/5"
                      : activeItem.status === "LIMITED"
                        ? "bg-amber-500 text-black active:scale-95 shadow-lg shadow-amber-500/25"
                        : "bg-v6-accent text-white active:scale-95 shadow-lg shadow-v6-accent/25"
                  }`}
                >
                  <ShoppingBag size={13} />
                  <span>{activeItem.status === "SOLD OUT" ? "SOLD OUT" : "INITIALIZE SHIPMENT"}</span>
                </button>
              </div>

              {/* 3. Inventory selector */}
              <div className="space-y-1.5 md:space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[8px] md:text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
                    CORES ({filteredItems.length})
                  </label>
                  {activeItem.status === "LIMITED" && (
                    <span className="text-[8px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                      CONDITION: LIMITED_STOCK
                    </span>
                  )}
                </div>
                <div className="flex md:flex-col gap-1.5 md:gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
                  {visibleItems.map((item, i) => {
                    const idx = visibleStart + i;
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectFigurine(idx)}
                        onMouseEnter={playHoverSound}
                        className={`flex-shrink-0 w-36 md:w-full flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all text-left snap-start ${
                          selectedIdx === idx
                            ? "bg-foreground/5 border-foreground/20 text-foreground"
                            : "border-transparent text-foreground/40 hover:text-foreground/80 hover:bg-foreground/[0.01]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full transition-all flex-shrink-0 ${selectedIdx === idx ? "bg-v6-accent shadow-[0_0_6px_var(--v6-glow)]" : "bg-foreground/10"}`} />
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-wide leading-none mb-0.5 truncate">{item.name}</p>
                            <p className="text-[7px] font-mono opacity-50 uppercase tracking-widest">{item.category}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black flex-shrink-0 ml-1">{item.price}</span>
                      </button>
                    );
                  })}
                </div>
                {totalListPages > 1 && (
                  <div className="flex items-center justify-between mt-1">
                    <button
                      onClick={() => setListPage(p => Math.max(0, p - 1))}
                      disabled={listPage === 0}
                      className="p-1.5 rounded-lg border border-foreground/10 text-foreground/40 hover:text-foreground hover:border-foreground/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <ArrowLeft size={10} />
                    </button>
                    <span className="text-[7px] font-mono opacity-30 uppercase tracking-widest">
                      {listPage + 1} / {totalListPages}
                    </span>
                    <button
                      onClick={() => setListPage(p => Math.min(totalListPages - 1, p + 1))}
                      disabled={listPage === totalListPages - 1}
                      className="p-1.5 rounded-lg border border-foreground/10 text-foreground/40 hover:text-foreground hover:border-foreground/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <ArrowRight size={10} />
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Specs */}
              <div className="space-y-2.5 md:space-y-5 v6-surface border border-foreground/10 rounded-xl md:rounded-[2rem] p-3 md:p-5">
                <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
                  <span>COLLECTOR DETAILS</span>
                  <Settings2 size={11} />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:gap-4 text-xs font-mono border-b border-foreground/5 pb-2.5 md:pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Scale</span>
                    <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase">{activeItem.scale}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Material</span>
                    <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase">{activeItem.material}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Condition</span>
                    <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase truncate block">{activeItem.condition}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Inventory</span>
                    <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase">{activeItem.inventory} Units</span>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <div className="text-[7px] md:text-[8px] font-black opacity-30 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Sparkles size={10} className="v6-accent-text" />
                    <span>HIGHLIGHTS</span>
                  </div>
                  <ul className="space-y-1 md:space-y-1.5">
                    {productDetails.features.map((feature, i) => (
                      <li key={i} className={`text-[9px] md:text-[9.5px] leading-relaxed text-foreground/80 font-medium flex items-start gap-1.5 ${i >= 2 ? "hidden md:flex" : "flex"}`}>
                        <CheckCircle2 size={10} className="text-v6-accent flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 bg-foreground/5 rounded-[2.5rem] border border-dashed border-foreground/10">
               <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
                  <Search size={24} className="opacity-20" />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-black uppercase italic">No Figurine Located</p>
                  <p className="text-[9px] font-black opacity-30 uppercase tracking-widest leading-relaxed">The search query did not return any authorized assets from the vault.</p>
               </div>
               <button 
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-2 bg-v6-accent/10 border border-v6-accent/20 rounded-xl text-[9px] font-black v6-accent-text uppercase tracking-widest hover:bg-v6-accent hover:text-white transition-all"
               >
                  Reset Search
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
