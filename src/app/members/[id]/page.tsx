import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchMemberById } from "@/app/actions/member-actions";
import { Shield, User, Package, Star, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchMemberById(id);
  if (!res.success || !res.data) return { title: "Dossier Not Found" };
  return { title: `${res.data.name} | Operative Dossier` };
}

function computeTier(orders: any[]) {
  const completed = orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status));
  const spend = completed.reduce((s, o) => s + (o.total || 0), 0);
  const count = completed.length;
  if (count >= 10 || spend >= 800) return "DIRECTOR";
  if (count >= 3 || spend >= 150) return "OPERATIVE";
  if (count >= 1) return "AGENT";
  return "RECRUIT";
}

const TIER_STYLES: Record<string, string> = {
  RECRUIT:   "text-foreground/40 border-foreground/10 bg-foreground/5",
  AGENT:     "text-v6-accent border-v6-accent/30 bg-v6-accent/10",
  OPERATIVE: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  DIRECTOR:  "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
};

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchMemberById(id);
  if (!res.success || !res.data) notFound();

  const user = res.data;
  const tier = computeTier(user.orders);
  const memberId = `V6-M-${user.id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
  const deployments = user.orders;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex-1 pt-28 md:pt-40 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Dossier Header */}
          <div className="relative bg-foreground/[0.02] border border-foreground/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-v6-accent/5 rounded-full blur-[100px] pointer-events-none" />
             
             <div className="relative z-10 flex flex-col md:flex-row gap-8 md:items-end justify-between">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-foreground/5 border border-foreground/10">
                      <Shield size={10} className="v6-accent-text" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-50">Confidential Dossier</span>
                   </div>
                   <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                     {user.operativeName || user.name}<span className="v6-accent-text">.</span>
                   </h1>
                   <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${TIER_STYLES[tier]}`}>
                        CLEARANCE: {tier}
                      </span>
                      <span className="text-[10px] font-mono text-foreground/40 px-3 py-1.5 border border-foreground/10 rounded-xl bg-background/50 uppercase tracking-widest">
                        ID: {memberId}
                      </span>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="px-6 py-4 bg-background/50 border border-foreground/10 rounded-2xl text-center min-w-[120px]">
                      <span className="text-[7px] font-black opacity-30 uppercase tracking-[0.2em] block mb-1">Total Deployments</span>
                      <span className="text-2xl font-black italic tracking-tighter">{deployments.length}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Dossier Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Timeline Card */}
             <div className="md:col-span-1 bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-2 text-[9px] font-black opacity-30 uppercase tracking-[0.4em]">
                   <Calendar size={12} className="v6-accent-text" />
                   <span>Service_Timeline</span>
                </div>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <span className="text-[8px] text-foreground/30 uppercase tracking-widest block">Authorization_Date</span>
                      <span className="text-base font-black uppercase italic tracking-tight">
                        {new Date(user.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[8px] text-foreground/30 uppercase tracking-widest block">Active_Years</span>
                      <span className="text-base font-black uppercase italic tracking-tight">
                        {new Date().getFullYear() - new Date(user.createdAt).getFullYear() + 1} SESSIONS
                      </span>
                   </div>
                </div>
             </div>

             {/* Recent Activity Card */}
             <div className="md:col-span-2 bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-2 text-[9px] font-black opacity-30 uppercase tracking-[0.4em]">
                   <Package size={12} className="v6-accent-text" />
                   <span>Recent_Deployment_Log</span>
                </div>
                
                <div className="space-y-3">
                   {deployments.length === 0 ? (
                      <p className="font-mono text-[10px] opacity-20 uppercase tracking-widest py-8 text-center border border-dashed border-foreground/10 rounded-2xl">No deployment records available for public viewing</p>
                   ) : (
                      deployments.slice(0, 3).map((order: any) => (
                         <div key={order.id} className="flex items-center justify-between p-4 bg-background/50 border border-foreground/5 rounded-2xl group hover:border-v6-accent/30 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10">
                                  <Package size={16} className="opacity-20 group-hover:text-v6-accent group-hover:opacity-100 transition-all" />
                               </div>
                               <div>
                                  <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">Deployment_Success</p>
                                  <p className="text-xs font-black uppercase italic tracking-tight truncate max-w-[200px]">
                                     {order.items.map((i: any) => i.artifactName).join(", ")}
                                  </p>
                               </div>
                            </div>
                            <span className="text-[10px] font-mono opacity-30">
                               {new Date(order.createdAt).toLocaleDateString("en-MY", { month: "short", year: "numeric" })}
                            </span>
                         </div>
                      ))
                   )}
                </div>
             </div>

          </div>

          {/* Footer Note */}
          <div className="text-center pt-8 opacity-20 space-y-2">
             <p className="text-[8px] font-black uppercase tracking-[0.5em]">// END_OF_DOSSIER</p>
             <p className="text-[7px] font-mono tracking-widest">VAULT_ENCRYPTION_V6_ACTIVE_BETA</p>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
