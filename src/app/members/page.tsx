import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchAllMembers } from "@/app/actions/member-actions";
import { MembersList } from "@/components/members-list";

export const metadata = { title: "Operatives | Vault 6 Studios" };

export default async function MembersPage() {
  const membersRes = await fetchAllMembers();
  const members = membersRes.success ? membersRes.data ?? [] : [];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="flex-1 pt-28 md:pt-40 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-v6-accent/10 border border-v6-accent/20">
               <div className="w-1.5 h-1.5 rounded-full bg-v6-accent animate-pulse" />
               <span className="text-[8px] font-black v6-accent-text uppercase tracking-[0.3em]">Verified Operatives Registry</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter">
              The <span className="v6-accent-text">Operative</span> Network<span className="v6-accent-text">.</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-30 max-w-2xl mx-auto leading-relaxed">
              // Authenticating secure deployment personnel and logistics directors across the global sector.
            </p>
          </div>

          <div className="pt-12 border-t border-foreground/5">
            <MembersList members={members as any} />
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
