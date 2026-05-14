"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { fetchArtifacts, createArtifact, updateArtifact, deleteArtifact, seedInitialData } from "@/app/actions/artifact-actions";
import { getSettings, updateSetting, seedDefaultSettings } from "@/app/actions/settings-actions";
import { fetchOrders } from "@/app/actions/order-actions";
import { verifyOmniKey, checkAdminAuth, logoutAdmin } from "@/app/actions/auth-actions";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RefreshCcw, Database, AlertCircle, CheckCircle2, Edit2, X, Settings2, Package, Save, Users, Shield, Lock, Key, LogOut, ShoppingCart, Eye } from "lucide-react";
import { useSettings } from "@/components/settings-provider";

export default function AdminPage() {
  const { refreshSettings } = useSettings();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [accessKey, setAccessKey] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<'artifacts' | 'settings' | 'users' | 'orders'>('artifacts');
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Mock Members State
  const [members, setMembers] = useState([
    { id: "V6-USR-001", name: "J. Doe", email: "j.doe@proton.me", clearance: "OMNI", status: "ACTIVE" },
    { id: "V6-USR-084", name: "S. Lee", email: "s.lee.neo@gmail.com", clearance: "LEVEL 2", status: "ACTIVE" },
    { id: "V6-USR-112", name: "K. Chen", email: "kchen99@hotmail.com", clearance: "LEVEL 1", status: "RESTRICTED" },
    { id: "V6-USR-344", name: "R. Batty", email: "tearsinrain@nexus.net", clearance: "LEVEL 1", status: "ACTIVE" },
  ]);

  // Artifact Form State
  const [artifactForm, setArtifactForm] = useState({
    deploymentId: "",
    name: "",
    series: "ORIGINS",
    category: "HEAD SCULPT",
    price: "$",
    status: "AVAILABLE",
    scale: "1/6",
    material: "RESIN"
  });

  const checkAuth = async () => {
    const auth = await checkAdminAuth();
    setIsAuthorized(auth);
    if (auth) loadData();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await verifyOmniKey(accessKey);
    if (res.success) {
      setIsAuthorized(true);
      loadData();
    } else {
      setAuthError(res.error || "INVALID KEY");
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthorized(false);
    setArtifacts([]);
  };

  const loadData = async () => {
    setLoading(true);
    const [artRes, setRes, ordRes] = await Promise.all([
      fetchArtifacts(),
      getSettings(),
      fetchOrders()
    ]);
    
    if (artRes.success) setArtifacts(artRes.data || []);
    if (setRes.success) setSiteSettings(setRes.data || {});
    if (ordRes.success) setOrders(ordRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // -- Artifact Handlers --
  const handleSeedArtifacts = async () => {
    const res = await seedInitialData();
    if (res.success) {
      setStatus({ type: 'success', msg: "Artifact database seeded." });
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
      material: item.material
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetArtifactForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setArtifactForm({
      deploymentId: "",
      name: "",
      series: "ORIGINS",
      category: "HEAD SCULPT",
      price: "$",
      status: "AVAILABLE",
      scale: "1/6",
      material: "RESIN"
    });
  };

  const handleArtifactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId 
      ? await updateArtifact(editingId, artifactForm)
      : await createArtifact(artifactForm);

    if (res.success) {
      setStatus({ type: 'success', msg: editingId ? "Artifact reconfigured." : "New artifact secured." });
      refreshSettings(); // Sync global state
      resetArtifactForm();
      loadData();
    } else {
      setStatus({ type: 'error', msg: "Deployment failed." });
    }
  };

  const handleDeleteArtifact = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteArtifact(id);
    if (res.success) {
      setStatus({ type: 'success', msg: "Artifact purged." });
      loadData();
    }
  };

  // -- Settings Handlers --
  const handleSeedSettings = async () => {
    const res = await seedDefaultSettings();
    if (res.success) {
      setStatus({ type: 'success', msg: "Default settings restored." });
      refreshSettings();
      loadData();
    }
  };

  const handleUpdateSetting = async (key: string) => {
    const value = siteSettings[key];
    const res = await updateSetting(key, value);
    if (res.success) {
      setStatus({ type: 'success', msg: `Setting [${key}] saved to database.` });
      refreshSettings();
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
            <button type="submit" className="w-full bg-v6-accent text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] transition-all shadow-xl shadow-v6-accent/30">
              VERIFY CLEARANCE
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
             <div className="flex bg-foreground/5 p-1.5 rounded-2xl border border-foreground/10 gap-1">
                <button 
                  onClick={() => setActiveTab('artifacts')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'artifacts' ? 'bg-background text-foreground shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Package size={14} />
                  Artifacts
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
          {activeTab === 'artifacts' && (
            <div className="space-y-12">
               {/* Artifact Tools */}
               <div className="flex justify-end gap-4">
                  <button 
                    onClick={handleSeedArtifacts}
                    className="flex items-center gap-2 px-6 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all"
                  >
                    <RefreshCcw size={14} />
                    Seed Initial Data
                  </button>
                  <button 
                    onClick={() => isAdding ? resetArtifactForm() : setIsAdding(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-v6-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-v6-accent/20"
                  >
                    {isAdding ? "Cancel Entry" : "New Artifact"}
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
                              <h3 className="text-xl font-black uppercase italic tracking-tighter">{editingId ? "RECONFIGURE ARTIFACT" : "DEPLOY NEW ARTIFACT"}</h3>
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
                                onChange={e => setArtifactForm({...artifactForm, deploymentId: e.target.value.toUpperCase()})}
                                placeholder="e.g. V6-00X" 
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Artifact Name</label>
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
                             <select 
                                value={artifactForm.series}
                                onChange={e => setArtifactForm({...artifactForm, series: e.target.value})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase"
                             >
                                <option>ORIGINS</option>
                                <option>NEO-NOIR</option>
                                <option>LEGENDS</option>
                                <option>COLLABS</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black opacity-40 uppercase tracking-widest ml-4">Price Point</label>
                             <input 
                                value={artifactForm.price}
                                onChange={e => setArtifactForm({...artifactForm, price: e.target.value})}
                                className="w-full bg-background border border-foreground/10 rounded-2xl py-4 px-6 font-black tracking-widest focus:border-v6-accent focus:outline-none uppercase" 
                             />
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
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-foreground/5 bg-foreground/[0.01]">
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Deployment ID</th>
                           <th className="p-6 text-[8px] font-black opacity-30 uppercase tracking-[0.3em]">Artifact Name</th>
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
                                 <button className="p-3 text-v6-accent/30 hover:text-v6-accent hover:bg-v6-accent/10 rounded-xl transition-all">
                                    <Eye size={16} />
                                 </button>
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

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { key: "hero_title", label: "Hero Brand Title" },
                    { key: "hero_subtitle", label: "Hero Subtitle" },
                    { key: "hero_subheading", label: "Hero Sub-Heading" },
                    { key: "hero_description", label: "Brand Narrative", isTextarea: true },
                    { key: "marquee_syndicate_status", label: "Marquee Label" },
                    { key: "marquee_member_count", label: "Active Member Count" },
                    { key: "marquee_vault_status", label: "Vault Operational Status" },
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
