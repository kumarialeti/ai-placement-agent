import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kumari Aleti | Full Stack Developer & AI Enthusiast",
  description: "Portfolio of Kumari Aleti, a B.Tech Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning, with hands-on experience in full-stack development and AI-powered applications.",
  openGraph: {
    title: "Kumari Aleti | Full Stack Developer",
    description: "Building practical web applications and AI-powered systems with modern full-stack technologies.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-zinc-950 text-zinc-50 antialiased selection:bg-emerald-500/30 selection:text-emerald-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
