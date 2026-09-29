import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import FeaturedProjects from "@/components/FeaturedProjects";
import Education from "@/components/Education";
import Certifications from "@/components/Certifications";
import FocusSection from "@/components/FocusSection";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <ExperienceTimeline />
      <FeaturedProjects />
      <Education />
      <Certifications />
      <FocusSection />
      <Contact />
    </>
  );
}
