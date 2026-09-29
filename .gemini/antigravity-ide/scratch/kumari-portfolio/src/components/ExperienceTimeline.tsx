"use client";
import { experience } from "@/data/portfolioData";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export default function ExperienceTimeline() {
  return (
    <section id="experience" className="py-24 bg-zinc-950 relative border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
            Experience
          </h2>
        </motion.div>

        <div className="relative border-l border-zinc-800 ml-4 md:ml-6 space-y-12 pb-8">
          {experience.map((exp, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative pl-8 md:pl-10"
            >
              <div className="absolute -left-[17px] top-1 bg-zinc-900 border-2 border-emerald-500 rounded-full p-1">
                <Briefcase size={16} className="text-emerald-400" />
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                    <p className="text-emerald-400 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="inline-block px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-400 text-sm mb-1">
                      {exp.duration}
                    </span>
                    <p className="text-zinc-500 text-sm block">{exp.location}</p>
                  </div>
                </div>
                
                <ul className="list-disc list-outside ml-4 space-y-2 text-zinc-400">
                  {exp.responsibilities.map((req, rIdx) => (
                    <li key={rIdx} className="pl-1 marker:text-zinc-600">{req}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
