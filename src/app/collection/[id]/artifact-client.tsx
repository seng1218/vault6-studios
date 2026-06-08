"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchArtifacts } from "@/app/actions/artifact-actions";
import { useCart } from "@/components/cart-provider";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, ArrowLeft, Shield, ShieldCheck, Package, Tag, Layers, Wrench, Box, Sparkles, ArrowUpRight, Zap, Maximize
} from "lucide-react";

import { TransmissionOverlay } from "@/components/transmission-overlay";

export default function ArtifactClient({ artifact: initialArtifact }: { artifact: any }) {
  const { addToCart } = useCart();

  const [artifact] = useState<any>(initialArtifact);
  const [related, setRelated] = useState<any[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [transmission, setTransmission] = useState({ isVisible: false, itemName: "" });

  const FRAME_COUNT = 24;

  useEffect(() => {
    const loadRelated = async () => {
      if (artifact) {
        const allRes = await fetchArtifacts();
        if (allRes.success && allRes.data) {
          const others = allRes.data.filter((a: any) => a.id !== artifact.id).slice(0, 3);
          setRelated(others);
        }
      }
    };
    loadRelated();
  }, [artifact]);

  const images = React.useMemo(() => {
    if (!artifact) return [];
    const uploaded = artifact.imageUrls
      ? artifact.imageUrls.split("\n").map((u: string) => u.trim()).filter(Boolean)
      : [];

    if (uploaded.length > 0) {
      return Array.from({ length: FRAME_COUNT }).map((_, i) => uploaded[i % uploaded.length]);
    }

    // Fallback: generate 24 distinct camera angles
    const name = (artifact.name || "").toLowerCase();
    const category = (artifact.category || "").toLowerCase();
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
  }, [artifact]);

  const highlights: string[] = artifact?.highlights
    ? artifact.highlights.split("\n").map((h: string) => h.trim()).filter(Boolean)
    : [];

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

  const handleAddToCart = () => {
    if (!artifact || artifact.status === "SOLD OUT") return;
    playSuccessSound();
    addToCart({
      id: artifact.id,
      deploymentId: artifact.deploymentId,
      name: artifact.name,
      price: artifact.price,
    });
    setTransmission({ isVisible: true, itemName: artifact.name });
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: "text-green-400 border-green-400/30 bg-green-400/10",
    LIMITED: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    "PRE-ORDER": "text-blue-400 border-blue-400/30 bg-blue-400/10",
    "SOLD OUT": "text-foreground/30 border-foreground/10 bg-foreground/5",
  };

  const specItems = artifact ? [
    { label: "Physical_Scale", value: artifact.scale, icon: Layers },
    { label: "Matrix_Material", value: artifact.material, icon: Wrench },
    { label: "Box_Integrity", value: artifact.condition, icon: Shield },
    { label: "Source_Foundry", value: artifact.manufacturer, icon: Tag },
    { label: "Classification", value: artifact.category, icon: Package },
    { label: "Vault_Stock", value: `${artifact.inventory} Units`, icon: Box },
  ] : [];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white overflow-x-hidden">
      <Header />

      <TransmissionOverlay 
        isVisible={transmission.isVisible} 
        itemName={transmission.itemName} 
        onComplete={() => setTransmission({ ...transmission, isVisible: false })} 
      />

      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-v6-accent/5 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(circle_at_50%_50%,var(--v6-glow),transparent_70%)]" />
      </div>

      <div className="relative z-10 pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-16 text-[9px] font-black uppercase tracking-[0.3em] opacity-40"
        >
          <Link href="/" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collection" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-colors">Collection</Link>
          <span>/</span>
          <span className="opacity-100 text-v6-accent">{artifact.name}</span>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10"
        >
          <Link
            href="/collection"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-v6-accent transition-all"
          >
            <ArrowLeft size={14} /> Back to Vault
          </Link>
        </motion.div>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 mb-32">

          {/* LEFT: Image Gallery / 3D Stage */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* 3D Observation Stage */}
            <div className="relative aspect-square bg-foreground/[0.02] dark:bg-black/40 border border-foreground/5 rounded-[3rem] overflow-hidden group flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDrag={handleDrag}
                className="absolute inset-0 z-20"
              />

              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.img
                    key={frameIndex}
                    src={images[frameIndex]}
                    alt={`${artifact.name} - Observation`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="w-full h-full object-contain p-12 mix-blend-lighten pointer-events-none select-none"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <div className="text-center space-y-3 opacity-20">
                      <Package size={48} className="mx-auto" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No Images</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HUD Telemetry */}
              <div className="absolute top-8 left-8 right-8 flex justify-between font-mono text-[8px] tracking-widest text-v6-accent/40 pointer-events-none">
                <div className="space-y-1 uppercase">
                  <div>OBJ_ID: {artifact.id}</div>
                  <div>COORD: 35.6895°N</div>
                </div>
                <div className="text-right space-y-1 uppercase">
                  <div>ROT_Y: {(frameIndex * (360 / FRAME_COUNT)).toFixed(1)}°</div>
                  <div>SYNC: STABLE</div>
                </div>
              </div>

              {/* Status badge */}
              <div className="absolute bottom-8 left-8">
                <span className={`text-[8px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest ${statusColors[artifact.status] || statusColors["SOLD OUT"]}`}>
                  {artifact.status}
                </span>
              </div>
              
              <div className="absolute bottom-8 right-8 font-mono text-[8px] text-foreground/20 uppercase tracking-[0.3em]">
                &lt; drag to rotate &gt;
              </div>
            </div>

            {/* Stage Indicators */}
            <div className="flex justify-center gap-1.5">
               {Array.from({ length: 12 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-[3px] rounded-full transition-all duration-300 ${Math.floor(frameIndex / (FRAME_COUNT/12)) === i ? "w-8 bg-v6-accent" : "w-2 bg-foreground/10"}`} 
                  />
               ))}
            </div>
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex flex-col justify-between gap-10"
          >
            {/* Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[9px] font-black v6-accent-text tracking-[0.4em] uppercase">{artifact.series} SERIES</span>
                <span className="text-[8px] font-mono opacity-30 px-2 py-0.5 border border-foreground/10 rounded uppercase">DEPLOY_{artifact.deploymentId}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{artifact.name}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 leading-relaxed max-w-md">
                HIGH-FIDELITY {artifact.category} ARCHIVE. AUTHENTICATED BY VAULT 6 PROTOCOLS. MANUFACTURED VIA {artifact.manufacturer.toUpperCase()}.
              </p>
            </div>

            {/* Price & CTA */}
            <div className="space-y-5 py-8 border-y border-foreground/5">
              <div>
                <span className="text-[8px] font-black opacity-30 tracking-[0.3em] uppercase block mb-1">Item Cost</span>
                <span className="text-5xl font-black italic tracking-tighter">{artifact.price}</span>
              </div>
              <button
                onClick={handleAddToCart}
                onMouseEnter={playHoverSound}
                disabled={artifact.status === "SOLD OUT"}
                className={`w-full h-20 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all duration-300 ${
                  artifact.status === "SOLD OUT"
                    ? "bg-foreground/5 text-foreground/20 cursor-not-allowed"
                    : "bg-v6-accent text-white hover:scale-[1.02] hover:shadow-[0_0_30px_var(--v6-glow)] active:scale-[0.98]"
                }`}
              >
                {artifact.status === "SOLD OUT" ? (
                  <><Package size={18} /> Out of Stock</>
                ) : (
                  <><ShoppingBag size={18} /> Acquire Figure</>
                )}
              </button>
            </div>

            {/* Spec Grid */}
            <div className="space-y-4">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">Technical Dossier</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specItems.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground/30">
                      <Icon size={10} />
                      <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider block truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
                  <Sparkles size={11} className="text-v6-accent" />
                  PHYSICAL_HIGHLIGHTS
                </div>
                <ul className="grid grid-cols-1 gap-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/60 leading-relaxed bg-foreground/[0.01] border border-foreground/5 p-4 rounded-2xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-v6-accent mt-1.5 animate-pulse" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.4em] block mb-2">Inventory Match</span>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">RELATED FIGURES<span className="v6-accent-text">.</span></h2>
              </div>
              <Link
                href="/collection"
                onMouseEnter={playHoverSound}
                onClick={playClickSound}
                className="text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-v6-accent transition-all flex items-center gap-2"
              >
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item, i) => {
                const isUrgent = item.status === "LIMITED" || item.status === "SOLD OUT";
                const accentClass = isUrgent ? "text-amber-500" : "v6-accent-text";
                const laserColor = isUrgent ? "#fbbf24" : "var(--v6-accent)";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={`/collection/${item.id}`}
                      onMouseEnter={playHoverSound}
                      onClick={playClickSound}
                      className={`block group bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] p-8 hover:bg-foreground/[0.05] ${isUrgent ? 'hover:border-amber-500/30' : 'hover:border-foreground/10'} transition-all duration-300 overflow-hidden relative`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${isUrgent ? 'from-amber-500/5' : 'from-v6-accent/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      {/* Laser Scan Animation */}
                      <motion.div
                        initial={{ top: "-10%" }}
                        whileHover={{ top: "110%" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                        style={{ backgroundColor: laserColor, boxShadow: `0 0 15px ${laserColor}` }}
                        className="absolute left-0 right-0 h-px z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                      />

                      <div className="relative z-10 space-y-4">
                        {/* Mini image */}
                        <div className="w-full h-32 rounded-2xl bg-foreground/5 overflow-hidden">
                          {item.imageUrls ? (
                            <img
                              src={item.imageUrls.split("\n")[0]?.trim()}
                              alt={item.name}
                              className="w-full h-full object-contain mix-blend-lighten"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[7px] font-black opacity-30 tracking-widest uppercase block mb-1`}>{item.category}</span>
                            <span className={`text-[8px] font-black tracking-widest uppercase ${accentClass}`}>{item.series}</span>
                          </div>
                          <h4 className={`font-black italic uppercase tracking-tighter leading-tight transition-colors ${isUrgent ? 'group-hover:text-amber-500' : 'group-hover:text-[var(--v6-accent)]'}`}>{item.name}</h4>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black italic">{item.price}</span>
                          <span className={`text-[8px] font-black tracking-widest ${item.status === 'SOLD OUT' ? "opacity-30 line-through" : accentClass}`}>{item.status}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </main>
  );
}
