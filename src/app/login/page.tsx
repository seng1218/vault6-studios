"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder login action
    console.log("Logging in with", email);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center pt-48 pb-32 px-6">
        <div className="max-w-md w-full">
          <div className="bg-foreground/[0.02] border border-foreground/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-v6-accent/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="text-center mb-12 space-y-4">
                <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock size={20} className="opacity-60" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">LOGIN</h1>
                <p className="opacity-60 text-sm">Welcome back. Enter your details to access your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <a href="#" className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="w-full bg-foreground text-background py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-v6-accent hover:text-white transition-all flex justify-center items-center gap-2 mt-4">
                  Sign In <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs opacity-40 font-medium">
                  Don't have an account yet? <Link href="/join" className="text-v6-accent hover:text-foreground font-black transition-colors">Sign up</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
