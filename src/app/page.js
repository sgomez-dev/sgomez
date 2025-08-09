import { About } from "@/components/About";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { Projects } from "@/components/Projects";

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl">
      <Navbar />
      <Hero />
      <div className="mt-200 md:mt-150 lg:mt-[40rem]">
        <About />
      </div>
      <Projects />
    </div>
  );
}
