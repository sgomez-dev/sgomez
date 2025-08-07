"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export const ParallaxBackground = () => {
  const { scrollYProgress } = useScroll();
  const damping = useSpring(scrollYProgress, { damping: 50 });
  const mountain3Y = useTransform(damping, [0, 1], ["0%", "70%"]);
  const planetsX = useTransform(damping, [0, 1], ["0%", "-20%"]);
  const mountain2Y = useTransform(damping, [0, 1], ["0%", "30%"]);
  const mountain1Y = useTransform(damping, [0, 1], ["0%", "0%"]);
  return (
    <section className="absolute inset-0 bg-black/40">
      <div className="relative h-screen overflow-y-hidden">
        <div
          className="absolute inset-0 w-full h-screen -z-50"
          style={{
            backgroundImage: "url(/models/assets/sky.jpg)",
            backgroundPosition: "bottom",
            backgroundSize: "cover",
          }}
        />
        <motion.div
          className="absolute inset-0 -z-40"
          style={{
            backgroundImage: "url(/models/assets/mountain-3.png)",
            backgroundPosition: "bottom",
            backgroundSize: "cover",
            y: mountain3Y,
          }}
        />
        <motion.div
          className="absolute inset-0 -z-30"
          style={{
            backgroundImage: "url(/models/assets/planets.png)",
            backgroundPosition: "bottom",
            backgroundSize: "cover",
            x: planetsX,
          }}
        />
        <motion.div
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage: "url(/models/assets/mountain-2.png)",
            backgroundPosition: "bottom",
            backgroundSize: "cover",
            y: mountain2Y,
          }}
        />
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: "url(/models/assets/mountain-1.png)",
            backgroundPosition: "bottom",
            backgroundSize: "cover",
            y: mountain1Y,
          }}
        />
      </div>
    </section>
  );
};
