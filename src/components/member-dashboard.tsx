"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, LogOut, ChevronDown, Settings2, Star,
  Package, Heart, User, Shield, Loader2, CheckCircle2, MapPin
} from "lucide-react";
import { logoutMember, toggleWishlist, updateMemberProfile } from "@/app/actions/member-actions";
import { useCart } from "@/components/cart-provider";
import { playClickSound } from "@/lib/sound-effects";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isPublicProfile: boolean;
  operativeName: string;
  createdAt: string;
}

interface OrderItemData {
  id: string;
  artifactId: string;
  artifactName: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  status: string;
  createdAt: string;
  items: OrderItemData[];
}

interface ArtifactData {
  id: string;
  deploymentId: string;
  name: string;
  category: string;
  price: string;
  status: string;
  imageUrls: string;
  series: string;
}

interface WishlistItemData {
  id: string;
  artifactId: string;
  createdAt: string;
  artifact: ArtifactData;
}

interface Props {
  user: UserData;
  orders: OrderData[];
  wishlist: WishlistItemData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeTier(orders: OrderData[]) {
  const completed = orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status));
  const spend = completed.reduce((s, o) => s + o.total, 0);
  const count = completed.length;
  if (count >= 10 || spend >= 800) return "DIRECTOR";
  if (count >= 3 || spend >= 150) return "OPERATIVE";
  if (count >= 1) return "AGENT";
  return "RECRUIT";
}

const TIER_STYLES: Record<string, string> = {
  RECRUIT:   "text-foreground/60 bg-foreground/5 border-foreground/20",
  AGENT:     "text-v6-accent bg-v6-accent/10 border-v6-accent/30",
  OPERATIVE: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  DIRECTOR:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  PAID:      "text-blue-400 bg-blue-500/10 border-blue-500/30",
  SHIPPED:   "text-purple-400 bg-purple-500/10 border-purple-500/30",
  COMPLETED: "text-green-400 bg-green-500/10 border-green-500/30",
  FAILED:    "text-red-400 bg-red-500/10 border-red-500/30",
  CANCELLED: "text-red-400 bg-red-500/10 border-red-500/30",
};

function getFirstImage(imageUrls: string): string {
  const first = imageUrls.split("\n").map(u => u.trim()).find(Boolean);
  return first || "/frames/motions rem/01.jpg";
}

function fmt(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "profile" | "orders" | "watchlist";

export function MemberDashboard({ user, orders, wishlist: initialWishlist }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [tab, setTab] = useState<Tab>("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: user.phone ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    zip: user.zip ?? "",
    country: user.country ?? "MALAYSIA",
    isPublicProfile: user.isPublicProfile ?? false,
    operativeName: user.operativeName ?? "",
  });

  const tier = computeTier(orders);
  const memberId = `V6-M-${user.id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;

  const nextTierData = React.useMemo(() => {
    const completed = orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status));
    const spend = completed.reduce((s, o) => s + o.total, 0);
    const count = completed.length;
    
    if (tier === "DIRECTOR") return { label: "MAX_LEVEL", progress: 100, requirement: "Omni-Clearance Secured" };
    
    let targetSpend = 150;
    let targetCount = 3;
    let nextLabel = "OPERATIVE";
    
    if (tier === "OPERATIVE" || (count >= 3 && tier === "AGENT")) {
      targetSpend = 800;
      targetCount = 10;
      nextLabel = "DIRECTOR";
    } else if (tier === "RECRUIT") {
      targetSpend = 1;
      targetCount = 1;
      nextLabel = "AGENT";
    }

    const spendProgress = Math.min((spend / targetSpend) * 100, 100);
    const countProgress = Math.min((count / targetCount) * 100, 100);
    const totalProgress = Math.max(spendProgress, countProgress);

    return {
      label: nextLabel,
      progress: totalProgress,
      requirement: totalProgress >= 100 ? "Authorization Pending" : `RM ${targetSpend} or ${targetCount} Deployments`
    };
  }, [orders, tier]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutMember();
    router.push("/");
    router.refresh();
  };

  const handleRemoveWishlist = async (artifactId: string, itemId: string) => {
    setRemovingId(itemId);
    await toggleWishlist(artifactId);
    setWishlist(w => w.filter(i => i.id !== itemId));
    setRemovingId(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateMemberProfile(profileForm);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "profile",   label: "OPERATIVE_PROFILE", icon: <User size={13} /> },
    { id: "orders",    label: "DEPLOYMENT_RECORDS", icon: <Package size={13} />, count: orders.length },
    { id: "watchlist", label: "INVENTORY_WATCH", icon: <Heart size={13} />, count: wishlist.length },
  ];

  return (
    <div className="space-y-6 md:space-y-10">

      {/* ── Hero clearance banner ── */}
      <div className="relative bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-6 md:p-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-v6-accent/10 rounded-full blur-[100px] pointer-events-none" />
        {/* Laser Scan Animation */}
        <motion.div
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-v6-accent opacity-10 z-0"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-v6-accent/10 border border-v6-accent/20">
               <div className="w-1.5 h-1.5 rounded-full bg-v6-accent animate-pulse" />
               <span className="text-[8px] font-black v6-accent-text uppercase tracking-widest">Vault Access Authorized</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">{user.name}<span className="v6-accent-text">.</span></h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${TIER_STYLES[tier]}`}>
                <Shield size={10} className="inline mr-2" />CLEARANCE: {tier}
              </span>
              <span className="text-[10px] font-mono text-foreground/40 px-3 py-1.5 border border-foreground/10 rounded-xl bg-background/50">
                ID: {memberId}
              </span>
            </div>

            {/* Clearance Progress Bar */}
            <div className="mt-8 space-y-3 max-w-md">
               <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                     <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Next_Security_Clearance</p>
                     <p className="text-[10px] font-black uppercase tracking-widest">{nextTierData.label}</p>
                  </div>
                  <span className="font-mono text-[9px] text-v6-accent font-black tracking-widest">{nextTierData.progress.toFixed(0)}%</span>
               </div>
               <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-foreground/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${nextTierData.progress}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 left-0 bg-v6-accent shadow-[0_0_10px_var(--v6-glow)]"
                  />
               </div>
               <p className="text-[7px] font-black opacity-20 uppercase tracking-[0.3em]">Protocols: {nextTierData.requirement}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-foreground/10 bg-background/50 text-foreground/40 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all text-[10px] font-black uppercase tracking-widest self-start sm:self-auto group"
          >
            {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />}
            Terminate Session
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-4 md:gap-8 border-b border-foreground/5 pb-0 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { playClickSound(); setTab(t.id); }}
            className={`flex items-center gap-2.5 px-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all -mb-px whitespace-nowrap ${
              tab === t.id
                ? "border-v6-accent text-v6-accent"
                : "border-transparent text-foreground/20 hover:text-foreground/60"
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[8px] px-2 py-0.5 rounded-md font-black ${tab === t.id ? "bg-v6-accent text-white" : "bg-foreground/5"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ─── PROFILE ─────────────────────────────────────────────────── */}
          {tab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Identity card */}
              <div className="lg:col-span-1 bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-8 space-y-8 relative overflow-hidden group">
                {/* Laser Scan Animation */}
                <motion.div
                  initial={{ top: "-10%" }}
                  whileHover={{ top: "110%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                />
                <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2">
                  <Star size={10} className="v6-accent-text" /><span>OPERATIVE_DOSSIER</span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Designation", value: user.name },
                    { label: "Uplink_Channel", value: user.email, mono: true },
                    { label: "Authorization_Date", value: new Date(user.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) },
                  ].map(row => (
                    <div key={row.label} className="space-y-1">
                      <span className="text-[8px] text-foreground/30 uppercase tracking-widest block">{row.label}</span>
                      <span className={`text-base font-black uppercase italic tracking-tight ${row.mono ? "font-mono opacity-80" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-foreground/5 space-y-1">
                  <div className="text-[8px] opacity-30 uppercase tracking-widest">Verified_Deployments</div>
                  <div className="text-3xl font-black italic tracking-tighter">
                    {orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)).length}
                    <span className="text-xs font-mono opacity-20 ml-3 not-italic uppercase tracking-normal">
                      / {fmt(orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)).reduce((s, o) => s + o.total, 0))} Total_Acquisition
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Privacy + Address */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Privacy & PDPA Compliance Section */}
                <div className="bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                  <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2">
                    <Shield size={10} className="v6-accent-text" /><span>PRIVACY_PROTOCOL_PDPA</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-background/50 border border-foreground/10 rounded-2xl">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest">Join Operative Network</p>
                        <p className="text-[8px] opacity-40 uppercase tracking-widest leading-relaxed max-w-[300px]">Allow other verified members to see your operative dossier and collection status.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setProfileForm(f => ({ ...f, isPublicProfile: !f.isPublicProfile }))}
                        className={`w-12 h-6 rounded-full transition-all relative ${profileForm.isPublicProfile ? "bg-v6-accent" : "bg-foreground/10"}`}
                      >
                        <motion.div 
                          animate={{ x: profileForm.isPublicProfile ? 24 : 4 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm" 
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {profileForm.isPublicProfile && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-1">OPERATIVE_CODE_NAME (PUBLIC)</label>
                          <input
                            type="text"
                            value={profileForm.operativeName}
                            onChange={e => setProfileForm(f => ({ ...f, operativeName: e.target.value }))}
                            placeholder="e.g. GHOST_UNIT_01"
                            className="w-full bg-background/50 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-v6-accent transition-all placeholder:opacity-10"
                          />
                          <p className="text-[7px] opacity-20 uppercase tracking-widest mt-2 ml-1 italic">// This name will be displayed in the network directory instead of your legal name.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Address + contact form */}
                <div className="bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-8 space-y-8 relative overflow-hidden group">
                  {/* Laser Scan Animation */}
                  <motion.div
                    initial={{ top: "-10%" }}
                    whileHover={{ top: "110%" }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                  />
                  <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-2">
                    <MapPin size={10} className="v6-accent-text" /><span>SECURE_DELIVERY_PROTOCOL</span>
                  </div>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-1">CONTACT_VOICE</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="+60 12-345 6789"
                          className="w-full bg-background/50 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-v6-accent transition-all placeholder:opacity-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-1">STREET_LEVEL_ACCESS</label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                          placeholder="No. 1, Jalan Example"
                          className="w-full bg-background/50 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-v6-accent transition-all placeholder:opacity-10"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-1">ZONE_CITY</label>
                        <input
                          type="text"
                          value={profileForm.city}
                          onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))}
                          placeholder="Kuala Lumpur"
                          className="w-full bg-background/50 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-v6-accent transition-all placeholder:opacity-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-1">SECTOR_CODE</label>
                        <input
                          type="text"
                          value={profileForm.zip}
                          onChange={e => setProfileForm(f => ({ ...f, zip: e.target.value }))}
                          placeholder="50000"
                          className="w-full bg-background/50 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-v6-accent transition-all placeholder:opacity-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-1">REGIONAL_STATE</label>
                        <input
                          type="text"
                          value={profileForm.state}
                          onChange={e => setProfileForm(f => ({ ...f, state: e.target.value }))}
                          placeholder="Selangor"
                          className="w-full bg-background/50 border border-foreground/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-v6-accent transition-all placeholder:opacity-10"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full h-14 bg-foreground text-background hover:bg-v6-accent hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
                    >
                      {savingProfile ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : profileSaved ? (
                        <><CheckCircle2 size={16} /><span>MANIFEST_UPDATED</span></>
                      ) : (
                        <><Settings2 size={16} /><span>UPDATE_LOGISTICS_MANIFEST</span></>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ─── ORDERS ──────────────────────────────────────────────────── */}
          {tab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-32 bg-foreground/[0.01] border border-dashed border-foreground/10 rounded-3xl space-y-4">
                  <Package size={40} className="mx-auto opacity-10" />
                  <p className="font-mono text-xs uppercase tracking-[0.5em] opacity-30">NO_ACQUISITIONS_RECORDED</p>
                  <Link href="/collection" className="inline-block px-8 py-3 bg-v6-accent/10 border border-v6-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-v6-accent hover:bg-v6-accent hover:text-white transition-all mt-4">
                    Access Vault →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-foreground/[0.02] border border-foreground/10 rounded-3xl overflow-hidden group relative">
                       {/* Laser Scan Animation */}
                       <motion.div
                        initial={{ top: "-10%" }}
                        whileHover={{ top: "110%" }}
                        transition={{ duration: 1.5, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                      />
                      <button
                        onClick={() => { playClickSound(); setExpandedOrder(expandedOrder === order.id ? null : order.id); }}
                        className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors relative z-10"
                      >
                        <div className="flex items-center gap-6 min-w-0">
                          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-foreground/5 items-center justify-center border border-foreground/5">
                             <Package size={18} className="opacity-20" />
                          </div>
                          <div className="text-left space-y-1">
                             <span className="font-mono text-[10px] font-black opacity-30 uppercase tracking-widest block">Deployment_ID</span>
                             <span className="font-black text-sm md:text-base tracking-widest">{order.orderNumber}</span>
                          </div>
                          <span className={`text-[8px] font-black px-3 py-1 rounded-full border uppercase tracking-wider flex-shrink-0 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                             <span className="text-[8px] font-black opacity-20 uppercase block tracking-widest">Total_Value</span>
                             <span className="font-black text-lg italic tracking-tighter">{fmt(order.total)}</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-v6-accent/10 transition-colors">
                            <ChevronDown
                              size={18}
                              className={`opacity-40 transition-transform duration-500 ${expandedOrder === order.id ? "rotate-180 text-v6-accent" : ""}`}
                            />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedOrder === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden relative z-10"
                          >
                            <div className="px-8 pb-8 space-y-6">
                              <div className="bg-background/50 border border-foreground/5 rounded-2xl p-6 space-y-4">
                                {order.items.map(item => (
                                  <div key={item.id} className="flex justify-between items-center group/item">
                                    <div className="flex flex-col">
                                       <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">Manifest_Item</span>
                                       <span className="font-black uppercase italic text-sm tracking-tight group-hover/item:text-v6-accent transition-colors">{item.artifactName} <span className="opacity-30 not-italic ml-2 font-mono">× {item.quantity}</span></span>
                                    </div>
                                    <span className="font-mono font-bold text-sm">{fmt(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-4 border-t border-foreground/5">
                                <div className="flex items-center gap-4">
                                   <div className="text-left">
                                      <span className="text-[8px] font-black opacity-20 uppercase block tracking-widest">Deployment_Date</span>
                                      <span className="text-[10px] font-bold uppercase">{new Date(order.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}</span>
                                   </div>
                                </div>
                                <Link 
                                  href={`/tracking?id=${order.orderNumber}`} 
                                  className="w-full sm:w-auto px-8 py-3 bg-v6-accent text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.05] active:scale-[0.95] transition-all text-center shadow-lg shadow-v6-accent/20"
                                >
                                  Track secure shipment →
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── WATCHLIST ───────────────────────────────────────────────── */}
          {tab === "watchlist" && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-32 bg-foreground/[0.01] border border-dashed border-foreground/10 rounded-3xl space-y-4">
                  <Heart size={40} className="mx-auto opacity-10" />
                  <p className="font-mono text-xs uppercase tracking-[0.5em] opacity-30">MONITOR_LIST_EMPTY</p>
                  <Link href="/collection" className="inline-block px-8 py-3 bg-v6-accent/10 border border-v6-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-v6-accent hover:bg-v6-accent hover:text-white transition-all mt-4">
                    Browse Vault →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {wishlist.map(item => (
                    <div key={item.id} className="bg-foreground/[0.02] border border-foreground/10 rounded-3xl overflow-hidden group relative">
                       {/* Laser Scan Animation */}
                       <motion.div
                        initial={{ top: "-10%" }}
                        whileHover={{ top: "110%" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                      />
                      <div className="aspect-square bg-foreground/5 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFirstImage(item.artifact.imageUrls)}
                          alt={item.artifact.name}
                          className="w-full h-full object-contain mix-blend-lighten p-6 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className={`absolute top-4 right-4 text-[7px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${STATUS_STYLES[item.artifact.status] ?? STATUS_STYLES.PENDING}`}>
                          {item.artifact.status}
                        </div>
                      </div>
                      <div className="p-5 space-y-4 relative z-10 bg-background/20 backdrop-blur-sm">
                        <div className="space-y-1">
                          <p className="text-[7px] opacity-30 uppercase tracking-widest font-mono">{item.artifact.deploymentId}</p>
                          <p className="text-[10px] font-black uppercase tracking-tight italic leading-tight truncate group-hover:text-v6-accent transition-colors">{item.artifact.name}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black italic tracking-tighter">{item.artifact.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={item.artifact.status === "SOLD OUT"}
                            onClick={() => {
                              playClickSound();
                              addToCart({
                                id: item.artifact.id,
                                deploymentId: item.artifact.deploymentId,
                                name: item.artifact.name,
                                price: item.artifact.price,
                              });
                            }}
                            className="flex-1 h-10 bg-v6-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-20 disabled:grayscale"
                          >
                            <ShoppingBag size={12} />
                            <span>SECURE</span>
                          </button>
                          <button
                            disabled={removingId === item.id}
                            onClick={() => handleRemoveWishlist(item.artifactId, item.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-foreground/10 text-foreground/30 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
                            title="Remove from Monitor"
                          >
                            {removingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <span className="text-xs font-black">✕</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
