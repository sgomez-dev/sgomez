"use client";

import { bio } from "../constants";
import { motion } from "framer-motion";

export const MyHistory = () => {
  return (
    <section className="c-space flex w-full flex-col gap-12 mt-20" id="bio">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-heading"
      >
        Mi historia
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="flex flex-col gap-6"
      >
        {bio.map((bioItem, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-neutral-400 leading-relaxed text-lg md:text-xl"
          >
            {bioItem}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );
};
