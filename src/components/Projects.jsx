"use client";

import { myProjects } from "@/constants";
import { Project } from "@/constants/Project";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect } from "react";

export const Projects = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const springX = useSpring(motionX, { damping: 10, stiffness: 50 });
  const springY = useSpring(motionY, { damping: 10, stiffness: 50 });
  const handleMouseMove = (e) => {
    motionX.set(e.clientX + 20);
    motionY.set(e.clientY + 20);
  };
  const [preview, setPreview] = useState(null);

  return (
    <section
      id="projects"
      onMouseMove={handleMouseMove}
      className="relative c-space section-spacing"
    >
      <h2 className="text-heading">Mis proyectos</h2>
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent mt-12 h-[1px] w-full" />
      {myProjects.map((project) => (
        <Project key={project.id} {...project} setPreview={setPreview} />
      ))}
      {preview && !isTouchDevice && (
        <motion.img
          style={{ x: springX, y: springY }}
          src={preview}
          className="fixed top-0 left-0 z-50 object-cover h-56 rounded-lg shadow-lg pointer-events-none w-80"
        />
      )}
    </section>
  );
};
