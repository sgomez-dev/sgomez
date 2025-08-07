"use client";

import { FlipWords } from "./FlipWords";
import { motion } from "motion/react";

const HeroText = () => {
  const words = [
    "desarrollo web",
    "desarrollo de software",
    "crear soluciones digitales",
    "la innovación",
    "el mundo digital",
  ];
  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="z-10 mt-20 text-center md:mt-40 md:text-left rounded-3xl bg-clip-text">
      <div className="flex-col hidden md:flex c-space">
        <motion.h1
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="text-4xl font-medium"
        >
          Hola, soy Santiago
        </motion.h1>
        <div className="flex flex-col items-start">
          <motion.p
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
            className="text-5xl font-medium text-neutral-300"
          >
            Un desarrollador <br /> con dedicación por
          </motion.p>
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
          >
            <FlipWords
              words={words}
              className="font-black text-white text-8xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col space-y-6 md:hidden">
        <motion.p
          variants={variants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="text-5xl font-medium mb-0"
        >
          Hola, soy Santiago
        </motion.p>
        <div>
          <motion.p
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
            className="text-3xl font-black text-neutral-300 mb-2"
          >
            con dedicación por
          </motion.p>
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
          >
            <FlipWords
              words={words}
              className="font-bold text-white text-xl px-3"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroText;
