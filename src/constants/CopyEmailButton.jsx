import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const CopyEmailButton = () => {
  const [copied, setCopied] = useState(false);
  const email = "contacto@sgomez.dev";
  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <motion.button
      onClick={copyToClipboard}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 1.05 }}
      className="relative px-4 py-4 text-sm text-center rounded-full font-extralight bg-primary w-[12rem] cursor-pointer overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.p
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="copied"
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            <img src="/models/assets/copy-done.svg" className="w-5" />
            Email copiado
          </motion.p>
        ) : (
          <motion.p
            className="flex items-center justify-center gap-2"
            key="copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <img src="/models/assets/copy.svg" className="w-5"></img>
            Copiar email
          </motion.p>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
