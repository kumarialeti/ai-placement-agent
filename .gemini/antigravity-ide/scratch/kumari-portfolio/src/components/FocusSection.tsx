"use client";
import { focusAreas } from "@/data/portfolioData";
import { motion } from "framer-motion";

export default function FocusSection() {
  return (
    <section className="py-24 bg-zinc-950 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
            What I Work With
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {focusAreas.map((area, idx) => (
            <motion.div 
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-900 transition-colors group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-9xl font-black text-zinc-800/20 group-hover:text-zinc-800/40 transition-colors -mt-8 -mr-8 select-none pointer-events-none">
                {area.id}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {area.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed max-w-sm">
                  {area.technologies}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
