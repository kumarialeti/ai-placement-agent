"use client";
import { about, education } from "@/data/portfolioData";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, MapPin } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-zinc-950 relative border-t border-zinc-900">
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
            {about.heading}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 prose prose-invert prose-lg text-zinc-400"
          >
            {about.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="leading-relaxed mb-6">{paragraph}</p>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-zinc-800 p-3 rounded-lg text-emerald-400">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Education</h3>
                  <p className="text-zinc-300 font-medium mb-1">{education.degree}</p>
                  <p className="text-zinc-400 text-sm">{education.institution}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      CGPA: {education.cgpa}
                    </span>
                    <span>Expected: {education.graduation}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-zinc-800 p-3 rounded-lg text-emerald-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Location</h3>
                  <p className="text-zinc-400">Macherla, Andhra Pradesh, India</p>
                  <p className="text-zinc-500 text-sm mt-1">Open to remote and relocation</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
