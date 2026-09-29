"use client";
import { education } from "@/data/portfolioData";
import { motion } from "framer-motion";
import { GraduationCap, Calendar } from "lucide-react";

export default function Education() {
  return (
    <section id="education" className="py-24 bg-zinc-950 relative border-t border-zinc-900">
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
            Education
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-900/50 transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <GraduationCap size={32} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{education.degree}</h3>
                <p className="text-lg text-emerald-400 font-medium mb-4">{education.institution}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
                    CGPA: <strong className="text-white">{education.cgpa}</strong>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg self-start md:self-auto">
              <Calendar size={16} />
              <span className="text-sm font-medium">Expected: {education.graduation}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
