"use client";

import { education } from "../constants";
import { motion } from "framer-motion";

export const Education = () => {
  return (
    <section
      className="c-space flex w-full flex-col gap-12 mt-20"
      id="education"
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-heading"
      >
        Educación
      </motion.h2>

      {/* Línea divisoria como en Projects */}
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent h-[1px] w-full" />

      <div className=" flex flex-col gap-6">
        {education.map((edu, index) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            key={index}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-white">{edu.degree}</h3>
            <p className="text-lg text-gray-300">{edu.institution}</p>
            <p className="text-sm text-gray-400">{edu.duration}</p>
            <p className="mt-3 text-gray-200">{edu.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
