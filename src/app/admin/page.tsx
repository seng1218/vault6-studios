"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { fetchArtifacts, createArtifact, updateArtifact, deleteArtifact, seedInitialData } from "@/app/actions/artifact-actions";
import { getSettings, updateSetting, seedDefaultSettings } from "@/app/actions/settings-actions";
import { fetchOrders, deleteOrder } from "@/app/actions/order-actions";
import { fetchAllMembers } from "@/app/actions/member-actions";
import { verifyOmniKey, checkAdminAuth, logoutAdmin, isTOTPConfigured, setupTOTP, disableTOTP } from "@/app/actions/auth-actions";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCcw, Database, AlertCircle, CheckCircle2, Edit2, X, Settings2, Package, Save, Users, Shield, Lock, Key, LogOut, ShoppingCart, Eye, Smartphone, ShieldCheck, ShieldOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSettings } from "@/components/settings-provider";

export default function AdminPage() {
  const { refreshSettings } = useSettings();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<'overview' | 'artifacts' | 'settings' | 'users' | 'orders'>('overview');
  const [artifacts, setFigures] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const handleExportOrders = () => {
    if (orders.length === 0) return;
    const headers = ["Order_Number", "Customer", "Email", "Total", "Status", "Date"];
    const rows = orders.map(o => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.total,
      o.status,
      new Date(o.createdAt).toISOString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `V6_LOGISTICS_MANIFEST_${new Date().getTime()}.csv`;
    a.click();
    setStatus({ type: 'success', msg: "Logistics manifest exported." });
  };

  // TOTP state
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpConfigured, setTotpConfigured] = useState(false);
  const [totpSetupInfo, setTotpSetupInfo] = useState<{ secret: string; uri: string } | null>(null);

  // Mock Members State
  const [members, setMembers] = useState<{ id: string; name: string; email?: string; clearance: string; status: string; }[]>([

  ]);

  const stats = React.useMemo(() => {
    const totalValue = artifacts.reduce((sum, a) => {
      const price = parseFloat(String(a.price).replace(/[^0-9.]/g, ""));
      const inv = Number(a.inventory) || 1;
      return sum + (isNaN(price) ? 0 : price * inv);
    }, 0);
    return {
      totalValue: Math.round(totalValue),
      pendingOrders: orders.filter(o => o.status === "PENDING").length,
      totalMembers: members.length,
      totalFigures: artifacts.reduce((sum, a) => sum + (Number(a.inventory) || 1), 0),
    };
  }, [artifacts, orders, members]);

  // Artifact Form State
  const [artifactForm, setArtifactForm] = useState({
    deploymentId: "V6-",
    name: "",
    series: "ORIGINS",
    category: "HEAD SCULPT",
    price: "RM ",
    status: "AVAILABLE",
    scale: "1/6",
    material: "RESIN",
    highlights: "",
    imageUrls: "",
    condition: "MISB",
    manufacturer: "Unknown",
    inventory: 1
  });

  const checkAuth = async () => {
    const auth = await checkAdminAuth();
    setIsAuthorized(auth);
    if (auth) loadData();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await verifyOmniKey(accessKey, totpRequired ? totpCode : undefined);
    if (res.success) {
      setIsAuthorized(true);
      loadData();
    } else if (res.requireTOTP) {
      setTotpRequired(true);
      setTotpCode("");
    } else {
      setAuthError(res.error || "INVALID KEY");
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthorized(false);
    setFigures([]);
  };

  const handleSetupTOTP = async () => {
    const info = await setupTOTP();
    setTotpSetupInfo(info);
    setTotpConfigured(true);
  };

  const handleDisableTOTP = async () => {
    if (!confirm("Disable authenticator? Admin login will only require the OMNI-KEY.")) return;
    await disableTOTP();
    setTotpConfigured(false);
    setTotpSetupInfo(null);
    setStatus({ type: 'success', msg: "Authenticator disabled." });
  };

  const loadData = async () => {
    setLoading(true);
    setDbError(null);
    const [artRes, setRes, ordRes, totpEnabled, membersRes] = await Promise.all([
      fetchArtifacts(),
      getSettings(),
      fetchOrders(),
      isTOTPConfigured(),
      fetchAllMembers(),
    ]);

    setTotpConfigured(totpEnabled);
    if (artRes.success) setFigures(artRes.data || []);
    if (setRes.success) setSiteSettings(setRes.data || {});
    if (ordRes.success) setOrders(ordRes.data || []);
    if (membersRes.success && membersRes.data) setMembers(
      membersRes.data.map(m => ({ ...m, clearance: "LEVEL 1", status: "ACTIVE" }))
    );

    if (!artRes.success && !setRes.success && !ordRes.success) {
      setDbError("Database unreachable. Check D1 binding and Cloudflare Worker configuration.");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // -- Artifact Handlers --
  const handleSeedFigures = async () => {
    const res = await seedInitialData();
    if (res.success) {
      setStatus({ type: 'success', msg: "Figure inventory seeded." });
      loadData();
    }
  };

  const handleEditArtifact = (item: any) => {
    setEditingId(item.id);
    setArtifactForm({
      deploymentId: item.deploymentId,
      name: item.name,
      series: item.series,
      category: item.category,
      price: item.price,
      status: item.status,
      scale: item.scale,
      material: item.material,
      highlights: item.highlights || "",
      imageUrls: item.imageUrls || "",
      condition: item.condition || "MISB",
      manufacturer: item.manufacturer || "Unknown",
      inventory: item.inventory || 1
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetArtifactForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setArtifactForm({
      deploymentId: "V6-",
      name: "",
      series: "ORIGINS",
      category: "HEAD SCULPT",
      price: "RM ",
      status: "AVAILABLE",
      scale: "1/6",
      material: "RESIN",
      highlights: "",
      imageUrls: "",
      condition: "MISB",
      manufacturer: "Unknown",
      inventory: 1
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setStatus({ type: 'success', msg: `Initializing sequence upload for ${e.target.files.length} frames...` });

    try {
      // Alphanumeric sort to ensure sequences (01.jpg, 02.jpg...) stay in order
      const sortedFiles = Array.from(e.target.files).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      const formData = new FormData();
      sortedFiles.forEach(file => formData.append('files', file));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok && data.urls) {
        // Functional setState — avoids stale closure overwriting form fields edited during upload
        setArtifactForm(prev => {
          const currentUrls = prev.imageUrls ? prev.imageUrls.split('\n').filter(Boolean) : [];
          return { ...prev, imageUrls: [...currentUrls, ...data.urls].join('\n') };
        });
        setStatus({ type: 'success', msg: `${data.urls.length} frames secured and synchronized.` });
      } else {
        setStatus({ type: 'error', msg: data.error ? `Upload failed: ${data.error}` : "Upload failed — check R2 bucket binding." });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: `Upload error: ${err?.message ?? "Network failure"}` });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setArtifactForm(prev => {
      const urls = prev.imageUrls.split('\n').filter(Boolean);
      urls.splice(index, 1);
      return { ...prev, imageUrls: urls.join('\n') };
    });
  };

  const handleArtifactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId 
      ? await updateArtifact(editingId, artifactForm)
      : await createArtifact(artifactForm);

    if (res.success) {
      setStatus({ type: 'success', msg: editingId ? "Figure reconfigured." : "New figure secured." });
      refreshSettings();
      resetArtifactForm();
      loadData();
    } else {
      setStatus({ type: 'error', msg: res.error || "Deployment failed." });
    }
  };

  const handleDeleteArtifact = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteArtifact(id);
    if (res.success) {
      setStatus({ type: 'success', msg: "Figure purged." });
      loadData();
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("TERMINATE DEPLOYMENT RECORD? This action is permanent and will purge all manifest data for this order.")) return;
    const res = await deleteOrder(id);
    if (res.success) {
      setStatus({ type: 'success', msg: "Deployment record purged." });
      loadData();
    } else {
      setStatus({ type: 'error', msg: res.error || "Purge failed." });
    }
  };

  // -- Settings Handlers --
  const handleSeedSettings = async () => {
    const res = await seedDefaultSettings();
    if (res.success) {
      setStatus({ type: 'success', msg: "Default settings restored." });
      refreshSettings();
      loadData();
    } else {
      setStatus({ type: 'error', msg: "Failed to restore defaults. Check database connection." });
    }
  };

  const handleUpdateSetting = async (key: string) => {
    const value = siteSettings[key];
    const res = await updateSetting(key, value);
    if (res.success) {
      setStatus({ type: 'success', msg: `Setting [${key}] saved to database.` });
      refreshSettings();
    } else {
      setStatus({ type: 'error', msg: res.error || `Failed to save [${key}].` });
    }
  };

  // -- Member Handlers --
  const toggleMemberStatus = (id: string) => {
    setMembers(members.map(m => {
      if (m.id === id) {
        const newStatus = m.status === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
        setStatus({ type: 'success', msg: `Operative ${id} status changed to ${newStatus}.` });
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to terminate this operative's access? This action is permanent.")) {
      setMembers(members.filter(m => m.id !== id));
      setStatus({ type: 'success', msg: `Operative ${id} has been permanently removed.` });
    }
  };

  const cycleClearance = (id: string) => {
    const levels = ["LEVEL 1", "LEVEL 2", "OMNI"];
    setMembers(members.map(m => {
      if (m.id === id) {
        const nextLevel = levels[(levels.indexOf(m.clearance) + 1) % levels.length];
        setStatus({ type: 'success', msg: `Operative ${id} clearance upgraded to ${nextLevel}.` });
        return { ...m, clearance: nextLevel };
      }
      return m;
    }));
  };

  // 1. Security Gate (Login Screen)
  if (isAuthorized === false) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(circle,var(--v6-glow),transparent_70%)]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md bg-foreground/[0.03] border border-foreground/10 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl space-y-10"
        >
          <div className="text-center space-y-4">
             <div className="w-16 h-16 bg-v6-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock size={32} className="v6-accent-text" />
             </div>
             <h1 className="text-3xl font-black italic uppercase tracking-tighter">OMNI-TERMINAL</h1>
             <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">AUTHORIZED PERSONNEL ONLY</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {!totpRequired ? (
              <div className="relative">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                <input
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="ENTER OMNI-KEY"
                  className="w-full bg-background border border-foreground/10 rounded-2xl py-6 pl-16 pr-6 font-black tracking-[0.5em] focus:border-v6-accent focus:outline-none transition-all"
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="relative">
                  <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-background border border-v6-accent/40 rounded-2xl py-6 pl-16 pr-6 font-black tracking-[1em] text-center focus:border-v6-accent focus:outline-none transition-all text-2xl"
                  />
                </div>
                <p className="text-[8px] opacity-40 text-center uppercase tracking-widest">Enter 6-digit code from Microsoft Authenticator</p>
                <button
                  type="button"
                  onClick={() => { setTotpRequired(false); setTotpCode(""); setAuthError(""); }}
                  className="w-full text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity"
                >
                  ← Back to OMNI-KEY
                </button>
              </motion.div>
            )}
            <button type="submit" className="w-full bg-v6-accent text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] transition-all shadow-xl shadow-v6-accent/30">
              {totpRequired ? "VERIFY CODE" : "VERIFY CLEARANCE"}
            </button>
          </form>

          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-[10px] font-black text-red-500 uppercase tracking-widest"
              >
                {authError}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    );
  }

  // 2. Loading State
  if (isAuthorized === null) return null;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <Header />

      <div className="relative z-10 pt-48 pb-32 px-6 md:px-12 max-w-6xl mx-auto space-y-12">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-v6-accent/10 border border-v6-accent/20">
                 <Shield size={12} className="v6-accent-text" />
                 <span className="text-[8px] font-black v6-accent-text uppercase tracking-widest">OMNI-LEVEL ACCESS</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">SUPER ADMIN<span className="v6-accent-text">.</span></h1>
           </div>

           {/* Tab Switcher & Logout */}
           <div className="flex flex-wrap items-center gap-4">
             <div className="flex bg-foreground/5 p-1.5 rounded-2xl border border-foreground/10 gap-1 overflow-x-auto scrollbar-hide">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-background text-foreground shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Database size={14} />
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('artifacts')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'artifacts' ? 'bg-background text-foreground shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Package size={14} />
                  Figures
                  </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-background text-foreground shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  <ShoppingCart size={14} />
                  Deployments
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-background text-foreground shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Users size={14} />
                  Syndicate Members
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-background text-foreground shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Settings2 size={14} />
                  Site Settings
                </button>
             </div>
             <button 
               onClick={handleLogout}
               className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
               title="Terminate Session"
             >
               <LogOut size={18} />
             </button>
           </div>
        </div>

        {/* DB Error Banner */}
        {dbError && (
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-500">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-widest">{dbError}</p>
          </div>
        )}

        {/* Status Alerts */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-center gap-3 p-4 rounded-xl border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
            >
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <p className="text-[10px] font-black uppercase tracking-widest">{status.msg}</p>
              <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100">×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-12">
               {/* Metric Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "NET_INVENTORY_VALUE", value: `RM ${stats.totalValue.toLocaleString()}`, icon: <Database size={20} />, trend: "+2.4%_WEEKLY" },
                    { label: "PENDING_DEPLOYMENTS", value: stats.pendingOrders, icon: <ShoppingCart size={20} />, trend: "STABLE_LATENCY" },
                    { label: "SYNDICATE_OPERATIVES", value: stats.totalMembers, icon: <Users size={20} />, trend: "SECURE_GROWTH" },
                    { label: "TOTAL_VAULT_UNITS", value: stats.totalFigures, icon: <Package size={20} />, trend: "84%_CAPACITY" },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-[0.03] font-mono text-[60px] leading-none pointer-events-none select-none group-hover:opacity-[0.06] transition-opacity">{metric.label.split('_')[0]}</div>
                       <div className="flex justify-between items-start relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-v6-accent/10 flex items-center justify-center border border-v6-accent/20">
                             <div className="v6-accent-text">{metric.icon}</div>
                          </div>
                          <span className="text-[7px] font-mono text-v6-accent font-black tracking-widest bg-v6-accent/5 px-2 py-1 rounded border border-v6-accent/10">{metric.trend}</span>
                       </div>
                       <div className="space-y-1 relative z-10">
                          <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">{metric.label}</p>
                          <p className="text-4xl font-black italic uppercase tracking-tighter">{metric.value}</p>
                       </div>
                       {/* Laser Scan Line */}
                       <div className="absolute bottom-0 left-0 w-full h-0.5 bg-v6-accent/10 group-hover:bg-v6-accent transition-all" />
                    </div>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Activity Log */}
                  <div className="lg:col-span-2 bg-foreground/[0.02] border border-foreground/5 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
                     <div className="flex justify-between items-center border-b border-foreground/5 pb-6">
                        <div className="space-y-1">
                           <h3 className="text-xl font-black uppercase italic tracking-tighter">VAULT_ACTION_LOG</h3>
                           <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">Live telemetry of recent database modifications</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           <span className="text-[7px] font-black text-green-500 uppercase tracking-widest">System Online</span>
                        </div>
                     </div>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                        {[
                           { action: "FIGURE_RECONFIGURED", target: "V6-002: Detective Samurai", time: "2 MINS AGO", op: "DIRECTOR_01" },
                           { action: "DEPLOYMENT_AUTHORIZED", target: "ORD_X84K92", time: "14 MINS AGO", op: "SYSTEM_AUTO" },
                           { action: "MEMBER_CLEARANCE_UPGRADE", target: "V6-USR-084", time: "1 HOUR AGO", op: "DIRECTOR_01" },
                           { action: "NEW_FIGURE_SECURED", target: "V6-088: Neo Ronin", time: "3 HOURS AGO", op: "DIRECTOR_01" },
                           { action: "PURGE_SEQUENCE_COMPLETE", target: "ORD_D03K11", time: "5 HOURS AGO", op: "DIRECTOR_01" },
                        ].map((log, i) => (
                           <div key={i} className="flex justify-between items-center p-5 bg-foreground/[0.01] border border-foreground/5 rounded-2xl group hover:bg-foreground/[0.03] transition-all">
                              <div className="flex gap-5 items-center">
                                 <div className="w-2 h-2 rounded-full bg-v6-accent/30 group-hover:bg-v6-accent transition-colors shadow-[0_0_10px_var(--v6-glow)]" />
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-tight italic group-hover:text-[var(--v6-accent)] transition-colors">{log.action} <span className="opacity-30 not-italic ml-2 font-mono">:: {log.target}</span></p>
                                    <div className="flex gap-4">
                                       <span className="text-[7px] font-mono opacity-20 uppercase tracking-widest">TIMESTAMP: {log.time}</span>
                                       <span className="text-[7px] font-mono opacity-20 uppercase tracking-widest">OP: {log.op}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Satellite Hub Status */}
                  <div className="lg:col-span-1 space-y-6">
                     <div className="bg-foreground text-background rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                        {/* Static Grain Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                        
                        <div className="space-y-1 relative z-10">
                           <h3 className="text-lg font-black uppercase italic tracking-tighter text-background">NETWORK_HEALTH</h3>
                           <p className="text-[7px] font-black opacity-30 text-background uppercase tracking-widest">Global Vault Node Latency</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                           {[
                              { loc: "TOKYO_VAULT", ping: "24MS", status: "STABLE" },
                              { loc: "KL_LOGISTICS", ping: "12MS", status: "STABLE" },
                              { loc: "SINGAPORE_HUB", ping: "42MS", status: "STABLE" },
                           ].map(node => (
                              <div key={node.loc} className="flex justify-between items-center border-b border-background/10 pb-3">
                                 <span className="text-[8px] font-black text-background uppercase tracking-widest">{node.loc}</span>
                                 <div className="flex gap-3 items-center">
                                    <span className="text-[8px] font-mono text-background/40">{node.ping}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="pt-6 relative z-10">
                           <div className="h-20 bg-background/5 rounded-2xl flex items-center justify-center border border-background/10">
                              <RefreshCcw className="text-background opacity-10 animate-spin-slow" size={32} />
                           </div>
                        </div>
                     </div>

                     {/* Security Advisory */}
                     <div className="p-8 border border-foreground/5 rounded-[2.5rem] bg-foreground/[0.01] flex items-start gap-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                        <ShieldCheck size={18} className="text-v6-accent mt-1 shrink-0" />
                        <div className="space-y-1">
                           <p className="text-[9px] font-black uppercase tracking-widest">Security_Protocol_V4</p>
                           <p className="text-[8px] font-bold uppercase tracking-tight leading-relaxed">Omni-clearance session active. All database mutations are logged to the blockchain audit trail.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
          
          {activeTab === 'artifacts' && (
            <div className="space-y-12">
               {/* Artifact Tools */}
               <div className="flex justify-end gap-4">
                  <button 
                    onClick={handleSeedFigures}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all"
                  >
                    <RefreshCcw size={14} />
                    Seed Initial Data
                  </button>
                  <button 
                    onClick={() => isAdding ? resetArtifactForm() : setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-v6-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-v6-accent/20"
                  >
                    {isAdding ? "Cancel Entry" : "New Figure"}
                  </button>
               </div>

               {/* Entry Form */}
               <AnimatePresence mode="wait">
                  {isAdding && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-foreground/[0.03] border border-v6-accent/30 rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl"
                    >
                       <div className="flex items-center justify-between border-b border-foreground/5 pb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-v6-accent/10 flex items-center justify-center">
                               {editingId ? <Edit2 size={20} className="v6-accent-text" /> : <Plus size={20} className="v6-accent-text" />}
                            </div>
                            <div>
                              <h3 className="text-xl font-black uppercase italic tracking-tighter">{editingId ? "RECONFIGURE FIGURE" : "DEPLOY NEW FIGURE"}</h3>
                              <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em]">{editingId ? "Modification Sequence Active" : "Database Initialization Sequence"}</p>
                            </div>
                          </div>
                          <button onClick={resetArtifactForm} className="p-2 hover:bg-foreground/5 rounded-full transition-colors opacity-30 hover:opacity-100">
                            <X size={20} />
                          </button>
                       </div>

                       <form onSubmit={handleArtifactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Deployment ID</label>
                             <input
                                required
                                value={artifactForm.deploymentId}
                                onChange={e => {
                                  const val = e.target.value.toUpperCase();
                                  if (!val.startsWith("V6-")) return;
                                  setArtifactForm({...artifactForm, deploymentId: val});
                                }}
                                placeholder="V6-001"
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Figure Name</label>
                             <input 
                                required
                                value={artifactForm.name}
                                onChange={e => setArtifactForm({...artifactForm, name: e.target.value})}
                                placeholder="e.g. Neo Tokyo Pilot" 
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase italic" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Series</label>
                             <input
                                list="series-suggestions"
                                value={artifactForm.series}
                                onChange={e => setArtifactForm({...artifactForm, series: e.target.value.toUpperCase()})}
                                placeholder="e.g. ORIGINS"
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             />
                             <datalist id="series-suggestions">
                                <option value="ORIGINS" />
                                <option value="NEO-NOIR" />
                                <option value="LEGENDS" />
                                <option value="COLLABS" />
                             </datalist>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Price Point (RM)</label>
                             <input
                                value={artifactForm.price}
                                onChange={e => {
                                  const val = e.target.value;
                                  if (!val.startsWith("RM")) {
                                    setArtifactForm({...artifactForm, price: "RM "});
                                    return;
                                  }
                                  setArtifactForm({...artifactForm, price: val});
                                }}
                                placeholder="RM 150"
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Category</label>
                             <select 
                                value={artifactForm.category}
                                onChange={e => setArtifactForm({...artifactForm, category: e.target.value})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             >
                                <option value="HEAD SCULPT">HEAD SCULPT</option>
                                <option value="FULL CUSTOM">FULL CUSTOM</option>
                                <option value="COLLECTIBLE">COLLECTIBLE</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Status</label>
                             <select 
                                value={artifactForm.status}
                                onChange={e => setArtifactForm({...artifactForm, status: e.target.value})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             >
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="LIMITED">LIMITED</option>
                                <option value="PRE-ORDER">PRE-ORDER</option>
                                <option value="SOLD OUT">SOLD OUT</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Scale</label>
                             <input 
                                value={artifactForm.scale}
                                onChange={e => setArtifactForm({...artifactForm, scale: e.target.value})}
                                placeholder="e.g. 1/6 or Non-scale"
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Material</label>
                             <select 
                                value={artifactForm.material}
                                onChange={e => setArtifactForm({...artifactForm, material: e.target.value})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             >
                                <option value="RESIN">RESIN</option>
                                <option value="PRO-POLY">PRO-POLY</option>
                                <option value="VINYL">VINYL</option>
                                <option value="MIXED">MIXED</option>
                                <option value="PVC">PVC</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Condition</label>
                             <select 
                                value={artifactForm.condition}
                                onChange={e => setArtifactForm({...artifactForm, condition: e.target.value})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             >
                                <option value="MISB">MISB (Mint in Sealed Box)</option>
                                <option value="MIB">MIB (Mint in Box)</option>
                                <option value="BIB">BIB (Back in Box)</option>
                                <option value="NRFB">NRFB (Never Removed From Box)</option>
                                <option value="NIB">NIB (New in Box)</option>
                                <option value="Loose - Mint">Loose - Mint</option>
                                <option value="Loose - Good">Loose - Good</option>
                                <option value="Damaged Box">Damaged Box</option>
                                <option value="Used - Acceptable">Used - Acceptable</option>
                                <option value="Parts/Repair">Parts/Repair</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Manufacturer</label>
                             <input 
                                value={artifactForm.manufacturer}
                                onChange={e => setArtifactForm({...artifactForm, manufacturer: e.target.value})}
                                placeholder="e.g. Vault 6 Studios"
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Stocks Volume</label>
                             <input 
                                type="number"
                                min="0"
                                value={artifactForm.inventory}
                                onChange={e => setArtifactForm({...artifactForm, inventory: parseInt(e.target.value) || 0})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none"
                             />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Product Highlights (One per line)</label>
                             <textarea 
                                value={artifactForm.highlights}
                                onChange={e => setArtifactForm({...artifactForm, highlights: e.target.value})}
                                placeholder="E.g. Ultra-flexibility chassis&#10;Real fabric clothing"
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-wider focus:border-v6-accent focus:outline-none min-h-[100px]"
                             />
                          </div>
                          <div className="md:col-span-2 space-y-4">
                             <div className="flex items-center justify-between ml-4 mr-4">
                               <label className="text-[8px] font-black opacity-40 uppercase tracking-widest">Photo Options (Upload Images)</label>
                               <span className="text-[8px] font-black tracking-widest font-mono" style={{ opacity: artifactForm.imageUrls ? 1 : 0.3 }}>
                                 {artifactForm.imageUrls ? artifactForm.imageUrls.split('\n').filter(Boolean).length : 0} PHOTO{artifactForm.imageUrls && artifactForm.imageUrls.split('\n').filter(Boolean).length !== 1 ? 'S' : ''} UPLOADED
                               </span>
                             </div>
                             
                             {/* Preview Gallery */}
                             {artifactForm.imageUrls && (
                               <div className="flex gap-4 overflow-x-auto pb-2">
                                 {artifactForm.imageUrls.split('\n').filter(Boolean).map((url, idx) => (
                                   <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-foreground/10 flex-shrink-0 group bg-foreground/5">
                                     <img src={url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                                     <button 
                                       type="button"
                                       onClick={() => removeImage(idx)}
                                       className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                     >
                                       <X size={12} />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             )}

                             {/* Upload Input */}
                             <div className="relative w-full bg-background border border-foreground/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-v6-accent transition-colors">
                               {isUploading ? (
                                 <div className="flex items-center gap-2 text-v6-accent font-mono text-[10px] tracking-widest uppercase animate-pulse">
                                   <div className="w-4 h-4 border-2 border-v6-accent border-t-transparent rounded-full animate-spin" />
                                   Uploading...
                                 </div>
                               ) : (
                                 <>
                                   <Package size={24} className="opacity-20 mb-2" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">Click or drag images to upload</span>
                                   <input 
                                     type="file" 
                                     multiple 
                                     accept="image/*"
                                     onChange={handleFileUpload}
                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                   />
                                 </>
                               )}
                             </div>
                          </div>
                          <div className="md:col-span-2">
                             <button type="submit" className="w-full bg-foreground text-background rounded-2xl py-5 font-black uppercase tracking-[0.4em] hover:bg-v6-accent hover:text-white transition-all shadow-xl">
                                {editingId ? "AUTHORIZE MODIFICATION" : "COMMENCE DEPLOYMENT"}
                             </button>
                          </div>
                       </form>
                    </motion.div>
                  )}
               </AnimatePresence>

               {/* Table */}
               <div className="bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                     <thead>
                        <tr className="border-b border-foreground/5 bg-foreground/[0.01]">
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Deployment ID</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Figure Name</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Category</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Series</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Status</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em] text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-foreground/5">
                        {loading ? (
                           <tr><td colSpan={5} className="p-20 text-center"><div className="inline-block w-6 h-6 border-2 border-v6-accent border-t-transparent rounded-full animate-spin" /></td></tr>
                        ) : artifacts.map((item) => (
                           <tr key={item.id} className="group hover:bg-foreground/[0.02] transition-colors">
                              <td className="p-6"><p className="text-[10px] font-black font-mono tracking-widest opacity-50">{item.deploymentId}</p></td>
                              <td className="p-6"><p className="text-sm font-black uppercase italic">{item.name}</p></td>
                              <td className="p-6"><p className="text-[10px] font-black opacity-80 tracking-widest">{item.category}</p></td>
                              <td className="p-6"><span className="text-[9px] font-black px-2 py-1 rounded bg-v6-accent/10 v6-accent-text tracking-widest">{item.series}</span></td>
                              <td className="p-6"><p className="text-[10px] font-black opacity-60 tracking-widest">{item.status}</p></td>
                              <td className="p-6 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button onClick={() => handleEditArtifact(item)} className="p-3 text-v6-accent/30 hover:text-v6-accent hover:bg-v6-accent/10 rounded-xl transition-all"><Edit2 size={16} /></button>
                                   <button onClick={() => handleDeleteArtifact(item.id)} className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-12">
               <div className="bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-foreground/5 bg-foreground/[0.01] flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">DEPLOYMENT LOGS</h3>
                      <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-1">Real-time syndicate transaction history</p>
                    </div>
                    <button onClick={loadData} className="p-3 hover:bg-foreground/5 rounded-xl transition-all opacity-40 hover:opacity-100">
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-foreground/5 bg-foreground/[0.01]">
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Order ID</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Operative</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Items</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Total Value</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Status</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em] text-right">Intel</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-foreground/5">
                        {loading ? (
                           <tr><td colSpan={6} className="p-20 text-center"><div className="inline-block w-6 h-6 border-2 border-v6-accent border-t-transparent rounded-full animate-spin" /></td></tr>
                        ) : orders.length === 0 ? (
                           <tr><td colSpan={6} className="p-20 text-center opacity-20 text-[10px] font-black uppercase tracking-widest">No deployments detected in the network</td></tr>
                        ) : orders.map((order) => (
                           <tr key={order.id} className="group hover:bg-foreground/[0.02] transition-colors">
                              <td className="p-6"><p className="text-[10px] font-black font-mono tracking-widest opacity-50">{order.orderNumber}</p></td>
                              <td className="p-6">
                                <p className="text-sm font-black uppercase italic">{order.customerName}</p>
                                <p className="text-[10px] font-medium opacity-40 font-mono mt-1">{order.customerEmail}</p>
                              </td>
                              <td className="p-6">
                                <div className="space-y-1">
                                  {order.items.map((item: any, i: number) => (
                                    <p key={i} className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                                      {item.quantity}x {item.artifactName}
                                    </p>
                                  ))}
                                </div>
                              </td>
                              <td className="p-6"><p className="text-sm font-black italic tracking-tighter">${order.total.toFixed(2)}</p></td>
                              <td className="p-6">
                                <span className={`text-[9px] font-black px-2 py-1 rounded tracking-widest ${order.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-foreground/10 text-foreground'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-6 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button className="p-3 text-v6-accent/30 hover:text-v6-accent hover:bg-v6-accent/10 rounded-xl transition-all">
                                      <Eye size={16} />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteOrder(order.id)}
                                     className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                     title="Terminate Deployment"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-12">
               {/* Clearance Guide */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { level: "LEVEL 1", priv: "Standard tracking, artifact alerts, archive watch." },
                    { level: "LEVEL 2", priv: "24h early pre-order access, detailed grading reports." },
                    { level: "OMNI", priv: "Early 3D kit downloads, direct support, vault reservations." },
                  ].map((guide) => (
                    <div key={guide.level} className="p-6 bg-foreground/[0.02] border border-foreground/5 rounded-2xl">
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded tracking-widest ${guide.level === 'OMNI' ? 'bg-v6-accent text-white' : 'bg-foreground/10'}`}>{guide.level}</span>
                       <p className="mt-3 text-[10px] opacity-40 leading-relaxed font-medium">{guide.priv}</p>
                    </div>
                  ))}
               </div>

               <div className="bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-foreground/5 bg-foreground/[0.01]">
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">OPERATIVE ROSTER</h3>
                    <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-1">Manage syndicate members and security clearances</p>
                  </div>
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-foreground/5 bg-foreground/[0.01]">
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Operative ID</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Alias & Comms</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Clearance Tier</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Status</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em] text-right">Directives</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-foreground/5">
                        {members.map((member) => (
                           <tr key={member.id} className={`group transition-colors ${member.status === 'RESTRICTED' ? 'bg-red-500/5' : 'hover:bg-foreground/[0.02]'}`}>
                              <td className="p-6"><p className="text-[10px] font-black font-mono tracking-widest opacity-50">{member.id}</p></td>
                              <td className="p-6">
                                <p className="text-sm font-black uppercase italic">{member.name}</p>
                                <p className="text-[10px] font-medium opacity-40 font-mono mt-1">{member.email}</p>
                              </td>
                              <td className="p-6">
                                <span className={`text-[9px] font-black px-2 py-1 rounded tracking-widest ${member.clearance === 'OMNI' ? 'bg-v6-accent text-white' : 'bg-foreground/10 text-foreground'}`}>
                                  {member.clearance}
                                </span>
                              </td>
                              <td className="p-6">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${member.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>
                                  {member.status}
                                </span>
                              </td>
                              <td className="p-6 text-right">
                                 <div className="flex justify-end gap-2">
                                   <button 
                                     onClick={() => cycleClearance(member.id)} 
                                     className="px-4 py-2 border border-foreground/10 text-[8px] font-black uppercase tracking-widest hover:bg-foreground/10 rounded-lg transition-all"
                                   >
                                     Modify Clearance
                                   </button>
                                   <button 
                                     onClick={() => toggleMemberStatus(member.id)} 
                                     className={`px-4 py-2 border text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${member.status === 'ACTIVE' ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-green-500/30 text-green-500 hover:bg-green-500/10'}`}
                                   >
                                     {member.status === 'ACTIVE' ? 'Restrict' : 'Restore'}
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteMember(member.id)}
                                     className="p-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm"
                                     title="Terminate Operative"
                                   >
                                     <Trash2 size={12} />
                                   </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12">
               {/* Settings Tools */}
               <div className="flex justify-end gap-4">
                  <button 
                    onClick={handleSeedSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all"
                  >
                    <RefreshCcw size={14} />
                    Reset to Defaults
                  </button>
               </div>

               {/* TOTP Security Section */}
               <div className="bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totpConfigured ? 'bg-green-500/10' : 'bg-foreground/5'}`}>
                        {totpConfigured ? <ShieldCheck size={20} className="text-green-500" /> : <ShieldOff size={20} className="opacity-30" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase italic tracking-tighter">Two-Factor Authentication</h3>
                        <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-0.5">
                          {totpConfigured ? "AUTHENTICATOR ACTIVE — Microsoft Authenticator required at login" : "DISABLED — Only OMNI-KEY required"}
                        </p>
                      </div>
                    </div>
                    {totpConfigured ? (
                      <button
                        onClick={handleDisableTOTP}
                        className="flex items-center gap-2 px-5 py-3 border border-red-500/30 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
                      >
                        <ShieldOff size={14} />
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={handleSetupTOTP}
                        className="flex items-center gap-2 px-5 py-3 bg-v6-accent/10 border border-v6-accent/20 rounded-xl text-[9px] font-black uppercase tracking-widest v6-accent-text hover:bg-v6-accent hover:text-white transition-all"
                      >
                        <Smartphone size={14} />
                        Enable Authenticator
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {totpSetupInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-v6-accent/20 rounded-2xl p-6 space-y-4 bg-v6-accent/5"
                      >
                        <p className="text-[9px] font-black uppercase tracking-widest v6-accent-text">Scan QR Code</p>
                        <ol className="text-[10px] opacity-60 space-y-1 list-decimal list-inside font-medium">
                          <li>Open any authenticator app (Google Authenticator, Microsoft Authenticator, Authy)</li>
                          <li>Tap <span className="font-black">+ / Add account → Scan QR code</span></li>
                          <li>Point camera at the code below</li>
                        </ol>
                        <div className="flex justify-center py-4">
                          <div className="bg-white p-4 rounded-2xl shadow-lg">
                            <QRCodeSVG
                              value={totpSetupInfo.uri}
                              size={180}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="M"
                            />
                          </div>
                        </div>
                        <details className="group">
                          <summary className="text-[8px] font-black uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity cursor-pointer list-none">
                            Can&apos;t scan? Enter secret manually ▾
                          </summary>
                          <div className="mt-3 bg-background rounded-xl p-4 space-y-1">
                            <p className="text-[8px] opacity-30 uppercase tracking-widest font-black">Secret Key</p>
                            <p className="font-mono text-sm font-black tracking-[0.2em] break-all">{totpSetupInfo.secret}</p>
                          </div>
                        </details>
                        <p className="text-[8px] opacity-40 uppercase tracking-widest">After scanning, verify by logging out and back in with the 6-digit code.</p>
                        <button onClick={() => setTotpSetupInfo(null)} className="text-[8px] font-black uppercase tracking-widest opacity-30 hover:opacity-70 transition-opacity">Dismiss</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { key: "hero_title", label: "Hero Brand Title" },
                    { key: "hero_subtitle", label: "Hero Subtitle" },
                    { key: "hero_subheading", label: "Hero Sub-Heading" },
                    { key: "hero_description", label: "Brand Narrative", isTextarea: true },
                  ].map((setting) => (
                    <div key={setting.key} className="bg-foreground/[0.02] dark:bg-white/[0.02] border border-foreground/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <label className="text-[8px] font-black v6-accent-text uppercase tracking-widest ml-2">{setting.label}</label>
                             <p className="text-[7px] font-mono opacity-20 uppercase ml-2">INDEX_KEY: {setting.key}</p>
                          </div>
                          <button 
                            onClick={() => handleUpdateSetting(setting.key)}
                            className="flex items-center gap-2 px-4 py-2 bg-v6-accent/10 border border-v6-accent/20 rounded-lg text-[8px] font-black uppercase tracking-widest v6-accent-text hover:bg-v6-accent hover:text-white transition-all shadow-lg"
                          >
                            <Save size={12} />
                            Save
                          </button>
                       </div>

                       {setting.isTextarea ? (
                         <textarea 
                           className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black text-sm leading-relaxed focus:border-v6-accent focus:outline-none min-h-[140px] transition-all"
                           value={siteSettings[setting.key] || ""}
                           onChange={(e) => setSiteSettings({...siteSettings, [setting.key]: e.target.value})}
                         />
                       ) : (
                         <input 
                           type="text"
                           className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase transition-all"
                           value={siteSettings[setting.key] || ""}
                           onChange={(e) => setSiteSettings({...siteSettings, [setting.key]: e.target.value})}
                         />
                       )}
                       
                       {/* Input Accent line */}
                       <div className="absolute bottom-0 left-0 w-full h-1 bg-v6-accent/5 group-focus-within:h-1 group-focus-within:bg-v6-accent transition-all duration-500" />
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center opacity-20 text-[8px] font-black uppercase tracking-[0.5em]">
           <p>SYSTEM ACCESS: SUPER_ADMIN</p>
           <p>PROTOCOL_V4_OMNI</p>
        </div>

      </div>
    </main>
  );
}
