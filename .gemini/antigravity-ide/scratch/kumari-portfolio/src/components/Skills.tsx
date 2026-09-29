"use client";
import { skills } from "@/data/portfolioData";
import { motion } from "framer-motion";
import { Code2, Database, BrainCircuit, Layout, Server, Wrench } from "lucide-react";

export default function Skills() {
  const skillCategories = [
    {
      title: "Frontend",
      icon: <Layout className="text-emerald-400" size={24} />,
      items: skills.frontend
    },
    {
      title: "Backend",
      icon: <Server className="text-emerald-400" size={24} />,
      items: skills.backend
    },
    {
      title: "Databases",
      icon: <Database className="text-emerald-400" size={24} />,
      items: skills.databases
    },
    {
      title: "AI / Machine Learning",
      icon: <BrainCircuit className="text-emerald-400" size={24} />,
      items: skills.ai
    },
    {
      title: "Authentication / API",
      icon: <Code2 className="text-emerald-400" size={24} />,
      items: skills.auth
    },
    {
      title: "Tools & Deployment",
      icon: <Wrench className="text-emerald-400" size={24} />,
      items: skills.tools
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="skills" className="py-24 bg-zinc-950 relative border-t border-zinc-900">
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
            Technical Skills
          </h2>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {skillCategories.map((category, idx) => (
            <motion.div 
              key={idx} 
              variants={item}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-emerald-900/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill, sIdx) => (
                  <span 
                    key={sIdx}
                    className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
