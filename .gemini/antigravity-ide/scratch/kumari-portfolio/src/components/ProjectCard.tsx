"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, LayoutDashboard, BrainCircuit, Users, Database } from "lucide-react";
import { Github } from "@/components/icons";
import ProjectCaseStudy from "./ProjectCaseStudy";

export default function ProjectCard({ project, index }: { project: any, index: number }) {
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
  const isAgriSaarthi = project.id === "agrisaarthi";

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}
      >
        <div className="w-full lg:w-1/2">
          <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group cursor-pointer`} onClick={() => setIsCaseStudyOpen(true)}>
            {/* Abstract visual representation instead of generic images */}
            {isAgriSaarthi ? (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-emerald-950/40 p-8 flex flex-col items-center justify-center">
                <div className="relative w-full h-full border border-emerald-900/50 rounded-xl bg-zinc-950/80 p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
                  
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    </div>
                    <div className="text-emerald-400 text-xs font-mono">AgriSaarthi AI</div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-4 w-full opacity-80">
                      <div className="flex flex-col gap-2 items-center text-center p-3 border border-zinc-800 rounded-lg bg-zinc-900">
                        <Users size={20} className="text-blue-400" />
                        <span className="text-[10px] text-zinc-400">Farmers</span>
                      </div>
                      <div className="flex flex-col gap-2 items-center text-center p-3 border border-emerald-900 rounded-lg bg-emerald-950/30">
                        <BrainCircuit size={20} className="text-emerald-400" />
                        <span className="text-[10px] text-zinc-400">LangGraph</span>
                      </div>
                      <div className="flex flex-col gap-2 items-center text-center p-3 border border-zinc-800 rounded-lg bg-zinc-900">
                        <Database size={20} className="text-orange-400" />
                        <span className="text-[10px] text-zinc-400">Market</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-blue-950/40 p-8 flex flex-col items-center justify-center">
                <div className="relative w-full h-full border border-blue-900/50 rounded-xl bg-zinc-950/80 p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"></div>
                  
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                      <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    </div>
                    <div className="text-blue-400 text-xs font-mono">DocSpot Platform</div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full flex gap-4 opacity-80">
                      <div className="w-1/3 flex flex-col gap-3">
                        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-lg"></div>
                        <div className="h-16 bg-zinc-900 border border-zinc-800 rounded-lg"></div>
                      </div>
                      <div className="w-2/3 h-full min-h-[80px] bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                        <LayoutDashboard size={24} className="text-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors duration-300"></div>
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl group-hover:ring-emerald-500/50 transition-colors duration-300"></div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-emerald-400 font-mono text-sm">{project.year}</span>
            <span className="w-8 h-[1px] bg-zinc-700"></span>
            <span className="text-zinc-400 text-sm tracking-wider uppercase font-semibold">{project.subtitle}</span>
          </div>
          
          <h3 className={`text-3xl sm:text-4xl font-bold text-white mb-6 ${isAgriSaarthi ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200' : ''}`}>
            {project.name}
          </h3>
          
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mb-6 shadow-xl relative z-10 lg:-ml-12 lg:mr-0 group-hover:-translate-y-1 transition-transform duration-300">
            <p className="text-zinc-300 leading-relaxed">
              {project.description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies.map((tech: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setIsCaseStudyOpen(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              View Case Study <ArrowRight size={16} />
            </button>
            <a 
              href={project.github} 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
            >
              <Github size={18} />
            </a>
            <a 
              href={project.live} 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </motion.div>

      {isCaseStudyOpen && (
        <ProjectCaseStudy 
          project={project} 
          onClose={() => setIsCaseStudyOpen(false)} 
        />
      )}
    </>
  );
}
