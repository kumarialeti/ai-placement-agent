import { personalInfo } from "@/data/portfolioData";
import { Mail } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="text-center md:text-left">
          <Link href="#home" className="text-white font-bold text-xl tracking-tighter mb-2 inline-block">
            {personalInfo.name}
          </Link>
          <p className="text-emerald-400 font-medium text-sm mb-1">{personalInfo.title}</p>
          <p className="text-zinc-500 text-sm">"Building with AI. Creating with purpose."</p>
        </div>

        <div className="flex gap-4">
          <a href={personalInfo.github} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <Github size={20} />
          </a>
          <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <Linkedin size={20} />
          </a>
          <a href={`mailto:${personalInfo.email}`} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-sm">
          © 2026 {personalInfo.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
