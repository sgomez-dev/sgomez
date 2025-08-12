import React from "react";
import { motion } from "framer-motion";

export const ProjectDetail = ({
  title,
  description,
  subDescription,
  image,
  tags,
  href,
  closeModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-hidden backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-6">
      <motion.div
        className="relative w-full max-w-2xl max-h-full overflow-y-auto border shadow-sm rounded-2xl bg-gradient-to-l from-midnight to-navy border-white/10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button
          onClick={closeModal}
          className="absolute p-2 rounded-sm top-3 right-3 sm:top-5 sm:right-5 bg-midnight hover:bg-gray-500 z-10"
        >
          <img
            src="/models/assets/close.svg"
            className="w-4 h-4 sm:w-6 sm:h-6"
          />
        </button>
        <img src={image} alt={title} className="w-full rounded-t-2xl" />
        <div className="p-4 sm:p-5">
          <h5 className="mb-2 text-xl sm:text-2xl font-bold text-white pr-8">
            {title}
          </h5>
          <p className="mb-3 text-sm sm:text-base font-normal text-neutral-400">
            {description}
          </p>
          {subDescription.map((subDesc, index) => (
            <p
              key={index}
              className="mb-3 text-sm sm:text-base font-normal text-neutral-400"
            >
              {subDesc}
            </p>
          ))}
          <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {tags.map((tag) => (
                <img
                  key={tag.id}
                  src={tag.path}
                  alt={tag.name}
                  className="rounded-lg size-8 sm:size-10 hover-animation"
                />
              ))}
            </div>
            <a
              href={href}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm sm:text-base font-medium cursor-pointer hover-animation self-start sm:self-auto"
            >
              Ver proyecto
              <img
                src="/models/assets/arrow-up.svg"
                className="size-3 sm:size-4"
              />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
