"use client";
import { personalInfo } from "@/data/portfolioData";
import { motion } from "framer-motion";
import { ArrowRight, Download, Mail } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-zinc-800/40 rounded-full blur-[128px]"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-3 py-1 rounded-full border border-emerald-900 bg-emerald-950/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-6">
            B.Tech CSE — Artificial Intelligence & Machine Learning | 2027
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{personalInfo.name}</span>
          </h1>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-300 mb-6">
            {personalInfo.title}
          </h2>
          
          <p className="text-lg text-zinc-400 mb-8 max-w-xl leading-relaxed">
            {personalInfo.shortTagline}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="#projects" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
              View Projects <ArrowRight size={18} />
            </Link>
            <a href={personalInfo.resumePath} target="_blank" rel="noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
              Download Resume <Download size={18} />
            </a>
            <Link href="#contact" className="bg-transparent hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-6 py-3 rounded-lg font-medium transition-all">
              Let's Connect
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors p-2 bg-zinc-900 rounded-full border border-zinc-800">
              <Github size={20} />
            </a>
            <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors p-2 bg-zinc-900 rounded-full border border-zinc-800">
              <Linkedin size={20} />
            </a>
            <a href={`mailto:${personalInfo.email}`} className="text-zinc-500 hover:text-white transition-colors p-2 bg-zinc-900 rounded-full border border-zinc-800">
              <Mail size={20} />
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex justify-center"
        >
          {/* Abstract technical visual */}
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden">
              {/* Fake IDE / Node representation */}
              <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="p-6 h-full flex flex-col justify-center relative">
                {/* Visual nodes */}
                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-center z-10 text-xs text-zinc-400">UI</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-900/40 border border-emerald-500/50 rounded-full flex items-center justify-center z-10 text-emerald-400 font-bold">API</div>
                <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-zinc-800 border border-zinc-600 rounded-lg flex items-center justify-center z-10 text-xs text-zinc-400">DB</div>
                <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-blue-900/30 border border-blue-500/30 rounded-lg flex items-center justify-center z-10 text-xs text-blue-400">RAG</div>
                
                {/* Connecting lines SVG */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
                  <path d="M 120 120 L 224 224" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 224 224 L 328 328" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 224 224 L 328 120" stroke="#059669" strokeWidth="2" opacity="0.5" />
                </svg>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -right-4 top-12 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg shadow-lg text-sm text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> React / Next.js
            </div>
            <div className="absolute -left-6 bottom-24 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg shadow-lg text-sm text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> LangGraph
            </div>
            <div className="absolute -right-2 bottom-12 bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-lg shadow-lg text-sm text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> FastAPI
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
