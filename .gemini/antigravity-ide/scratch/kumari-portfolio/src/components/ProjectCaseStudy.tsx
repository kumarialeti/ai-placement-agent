"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Github, CheckCircle2 } from "@/components/icons";

export default function ProjectCaseStudy({ project, onClose }: { project: any, onClose: () => void }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const isAgriSaarthi = project.id === "agrisaarthi";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-20 backdrop-blur-md">
            <div>
              <p className="text-emerald-400 font-mono text-xs mb-1">{project.year} • {project.subtitle}</p>
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors border border-zinc-800"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    Architecture
                  </h3>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-x-auto">
                    {isAgriSaarthi ? (
                      <div className="min-w-[500px] flex flex-col items-center gap-3 py-4">
                        <div className="px-6 py-2 bg-zinc-800 rounded-lg text-white border border-zinc-700 w-48 text-center text-sm font-medium shadow-sm">User</div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="px-6 py-2 bg-emerald-950/40 rounded-lg text-emerald-100 border border-emerald-900 w-48 text-center text-sm shadow-sm">React Frontend</div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="px-6 py-2 bg-zinc-800 rounded-lg text-white border border-zinc-700 w-48 text-center text-sm shadow-sm">Node.js / Express API</div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="px-6 py-2 bg-blue-950/40 rounded-lg text-blue-100 border border-blue-900 w-48 text-center text-sm shadow-sm">FastAPI AI Service</div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="px-6 py-3 bg-purple-950/40 rounded-lg text-purple-100 border border-purple-900 w-64 text-center text-sm font-medium shadow-sm">LangGraph Multi-Agent Orchestration</div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="flex gap-4">
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700 text-xs shadow-sm">Weather Agent</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700 text-xs shadow-sm">Market Agent</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700 text-xs shadow-sm">Crop Health Agent</div>
                        </div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="px-6 py-2 bg-emerald-950/40 rounded-lg text-emerald-100 border border-emerald-900 w-56 text-center text-sm shadow-sm">Gemini API + RAG</div>
                        <div className="h-4 w-px bg-emerald-500/50"></div>
                        <div className="flex gap-4">
                          <div className="px-6 py-2 bg-orange-950/40 rounded-lg text-orange-100 border border-orange-900 w-40 text-center text-xs shadow-sm">ChromaDB</div>
                          <div className="px-6 py-2 bg-orange-950/40 rounded-lg text-orange-100 border border-orange-900 w-40 text-center text-xs shadow-sm">External APIs</div>
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-[500px] flex flex-col items-center gap-3 py-4">
                        <div className="flex gap-4">
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-white border border-zinc-700 text-sm shadow-sm">Patient</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-white border border-zinc-700 text-sm shadow-sm">Doctor</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-white border border-zinc-700 text-sm shadow-sm">Admin</div>
                        </div>
                        <div className="h-4 w-px bg-blue-500/50"></div>
                        <div className="px-6 py-3 bg-blue-950/40 rounded-lg text-blue-100 border border-blue-900 w-64 text-center text-sm font-medium shadow-sm">React / Vite Frontend</div>
                        <div className="h-4 w-px bg-blue-500/50"></div>
                        <div className="px-6 py-3 bg-zinc-800 rounded-lg text-white border border-zinc-700 w-64 text-center text-sm font-medium shadow-sm">Node.js / Express REST API</div>
                        <div className="h-4 w-px bg-blue-500/50"></div>
                        <div className="px-6 py-2 bg-emerald-950/40 rounded-lg text-emerald-100 border border-emerald-900 w-48 text-center text-sm shadow-sm">JWT Authentication</div>
                        <div className="h-4 w-px bg-blue-500/50"></div>
                        <div className="flex gap-4">
                          <div className="px-6 py-2 bg-orange-950/40 rounded-lg text-orange-100 border border-orange-900 w-32 text-center text-sm shadow-sm">MongoDB</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700 text-xs flex items-center justify-center shadow-sm">Socket.io</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700 text-xs flex items-center justify-center shadow-sm">Jitsi</div>
                          <div className="px-4 py-2 bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-700 text-xs flex items-center justify-center shadow-sm">Cloudinary</div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.features.map((feature: any, idx: number) => (
                      <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          {feature.title}
                        </h4>
                        <ul className="space-y-1">
                          {feature.details.map((detail: string, dIdx: number) => (
                            <li key={dIdx} className="text-sm text-zinc-400 flex items-start gap-2">
                              <span className="text-zinc-600 mt-0.5">•</span> {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
                
              </div>
              
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4">Project Links</h3>
                  <div className="space-y-3">
                    <a 
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      <ExternalLink size={18} /> Live Demo
                    </a>
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                    >
                      <Github size={18} /> View Source
                    </a>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4">Technology Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md text-xs font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
