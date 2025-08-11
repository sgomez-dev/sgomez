"use client";

import { recommendations } from "../constants";
import { motion } from "framer-motion";
import { FaLinkedinIn } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 1 },
  },
};
const Recommendations = () => {
  return (
    <div className="container mx-auto " id="recommendations">
      <h2 className="mb-12 mt-20 text-center text-4xl font-semibold">
        Recomendaciones
      </h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
        className="mx-2 rounded-3xl px-4 py-10 lg:px-20 border border-stone-50/30 grid grid-cols-1 gap-x-20 gap-y-10 md:grid-cols-2"
      >
        {recommendations.map((recommendation, index) => (
          <motion.div
            variants={itemVariants}
            key={index}
            className={`items-center justify-between grid gap-y-2 ${
              index !== recommendations.length - 1
                ? "border-b border-stone-50/30"
                : ""
            }`}
          >
            <div className="flex items-center justify-start gap-2">
              <img
                src={recommendation.image}
                alt={recommendation.name}
                className="w-10 h-10 rounded-full"
              />
              <h3 className="text-xl font-semibold md:text-xl">
                {recommendation.name}
              </h3>
              <a
                href={recommendation.profileRecommenderUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn className="text-xl text-blue-500" />
              </a>
            </div>
            <div className="text-sm md:text-base text-stone-500">
              <span>{recommendation.date}</span>
            </div>
            <div className="text-sm md:text-base">
              <span>{recommendation.description}</span>
            </div>
            <div className="text-sm flex items-center justify-start gap-x-2 pb-8">
              <a
                href={recommendation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-2"
              >
                <FaLinkedinIn className="text-md text-blue-500" />
                <p className="text-sm text-blue-500">Ver en LinkedIn</p>
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Recommendations;
