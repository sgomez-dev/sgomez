import { About } from "@/components/About";
import Certifications from "@/components/Certifications";
import { Contact } from "@/components/Contact";
import { Experiences } from "@/components/Experiences";
import { Education } from "@/components/Education";
import { MyHistory } from "@/components/MyHistory";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { Projects } from "@/components/Projects";
import Recommendations from "@/components/Recommendations";
import { FloatingCTA } from "@/components/FloatingCTA";

import { generateMetadata } from "@/components/Metadata";
import { metadataConfig } from "@/constants/metadata";

export const metadata = generateMetadata(metadataConfig);

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl">
      <Navbar />
      <FloatingCTA />
      <Hero />
      <div className="mt-200 md:mt-150 lg:mt-[40rem]">
        <About />
      </div>
      <MyHistory />
      <Experiences />
      <Projects />
      <Recommendations />
      <Certifications />
      <Education />
      <Contact />
      <Footer />
    </div>
  );
}
