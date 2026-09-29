"use client";
import { certifications } from "@/data/portfolioData";
import { motion } from "framer-motion";
import { Award, CheckCircle } from "lucide-react";

export default function Certifications() {
  return (
    <section className="py-12 bg-zinc-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-4">
            <span className="w-6 h-1 bg-emerald-500 rounded-full"></span>
            Certifications
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert, idx) => {
            const [org, title] = cert.split(" - ");
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-emerald-900/30 transition-colors flex items-start gap-4"
              >
                <div className="text-emerald-500 mt-1">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm leading-tight mb-1">{title}</h3>
                  <p className="text-zinc-500 text-xs">{org}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
