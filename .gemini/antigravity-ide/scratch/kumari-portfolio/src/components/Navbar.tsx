"use client";
import Link from "next/link";
import { personalInfo } from "@/data/portfolioData";
import { Menu, X, Mail } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Education", href: "#education" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="#home" className="text-white font-bold text-xl tracking-tighter flex items-center gap-2">
              <span className="bg-emerald-500 text-black px-2 py-1 rounded-sm text-sm">KA</span>
              {personalInfo.name}
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-zinc-300 hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href={personalInfo.resumePath} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Resume
            </a>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-zinc-300 hover:text-emerald-400 block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex space-x-4 px-3 py-4 mt-4 border-t border-zinc-800">
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                <Github size={24} />
              </a>
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white">
                <Linkedin size={24} />
              </a>
              <a href={personalInfo.resumePath} target="_blank" rel="noreferrer" className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium flex-1 text-center">
                Download Resume
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
