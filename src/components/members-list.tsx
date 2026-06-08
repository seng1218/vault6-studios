"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, User, Star, Package, ArrowRight } from "lucide-react";

interface Member {
  id: string;
  name: string;
  operativeName?: string | null;
  createdAt: Date;
  orders: any[];
}

interface Props {
  members: Member[];
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

export function MembersList({ members }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member, i) => {
        const tier = computeTier(member.orders);
        const memberId = `V6-M-${member.id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;
        const deploymentCount = member.orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)).length;

        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="group relative"
          >
            <Link href={`/members/${member.id}`}>
              <div className="bg-foreground/[0.02] border border-foreground/10 rounded-3xl p-6 md:p-8 hover:bg-foreground/[0.04] hover:border-v6-accent/30 transition-all relative overflow-hidden h-full flex flex-col justify-between">
                {/* Decorative Laser Line */}
                <motion.div
                  initial={{ top: "-10%" }}
                  whileHover={{ top: "110%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-px bg-v6-accent opacity-0 group-hover:opacity-40 z-20 pointer-events-none"
                />

                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center border border-foreground/10 group-hover:border-v6-accent/30 transition-colors">
                      <User size={20} className="opacity-40 group-hover:opacity-100 group-hover:text-v6-accent transition-all" />
                    </div>
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${TIER_STYLES[tier]}`}>
                      {tier}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-v6-accent transition-colors">
                      {member.operativeName || member.name}
                    </h3>
                    <p className="font-mono text-[9px] opacity-30 uppercase tracking-[0.2em]">{memberId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-foreground/5">
                    <div className="space-y-0.5">
                      <span className="text-[7px] font-black opacity-20 uppercase tracking-widest block">Deployments</span>
                      <div className="flex items-center gap-2">
                        <Package size={10} className="opacity-40" />
                        <span className="text-xs font-black italic">{deploymentCount}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[7px] font-black opacity-20 uppercase tracking-widest block">Authorization</span>
                      <div className="flex items-center gap-2">
                        <Star size={10} className="opacity-40" />
                        <span className="text-xs font-black italic">
                          {new Date(member.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20 group-hover:text-v6-accent transition-colors">
                  <span>View Dossier</span>
                  <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
