"use client";

import { useState } from "react";
import { motion } from "motion/react";

function Navigation() {
  return (
    <ul className="nav-ul">
      <li className="nav-li">
        <a href="" className="nav-link">
          Bio
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Habilidades
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Experiencia
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Proyectos
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Recomendaciones
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Certificaciones
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Educación
        </a>
      </li>
      <li className="nav-li">
        <a href="" className="nav-link">
          Contacto
        </a>
      </li>
    </ul>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed inset-x-0 z-20 w-full backdrop-blur-lg bg-primary/40">
      <div className="mx-auto c-space max-w-7xl">
        <div className="flex items-center justify-between py-2 sm:py-0">
          <a
            href="/"
            className="text-xl font-bold transition-colors text-neutral-400 hover:text-white"
          >
            Santiago
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex cursor-pointer  text-neutral-400 hover:text-white hover:font-bold focus:outline-none sm:hidden"
          >
            <img
              src={
                isOpen ? "models/assets/close.svg" : "models/assets/menu.svg"
              }
              className="w-6 h-6"
              alt=""
            />
          </button>
          <nav className="hidden sm:flex">
            <Navigation />
          </nav>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ maxHeight: "100vh" }}
          transition={{ duration: 1 }}
          className="block overflow-hidden text-center sm:hidden"
        >
          <nav className="pb-5">
            <Navigation />
          </nav>
        </motion.div>
      )}
    </div>
  );
};

export default Navbar;
