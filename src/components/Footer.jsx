"use client";

import { useState } from "react";
import { mySocials } from "../constants";

const Footer = () => {
  const year = new Date().getFullYear();
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-5 pb-3 text-sm text-neutral-400 c-space">
        <div className="mb-4 bg-gradient-to-r from-transparent via-neutral-700 to-transparent h-[1px] w-full" />

        <div className="flex gap-2">
          <button
            onClick={() => openModal("terms")}
            className="transition-colors duration-200 hover:text-white"
          >
            Terms & Conditions
          </button>
          <span>|</span>
          <button
            onClick={() => openModal("privacy")}
            className="transition-colors duration-200 hover:text-white"
          >
            Privacy Policy
          </button>
        </div>

        <div className="flex gap-3">
          {mySocials.map((social, index) => (
            <a
              href={social.href}
              key={index}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-200 hover:scale-110"
            >
              <img src={social.icon} className="w-5 h-5" alt={social.name} />
            </a>
          ))}
        </div>

        <p>© {year} SGOMEZ-DEV. All rights reserved.</p>
      </section>

      {/* Modal Overlay */}
      {modalContent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-primary p-6 max-w-xl mx-4 rounded-lg overflow-y-auto max-h-[80vh] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="mb-4 text-lg font-bold text-right w-full hover:text-red-400"
              aria-label="Cerrar modal"
            >
              ×
            </button>

            {modalContent === "terms" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
                <p className="mb-3 text-neutral-300">
                  Bienvenido/a a SGOMEZ-DEV. Al acceder y usar nuestro sitio
                  web, aceptas los siguientes términos y condiciones. Por favor,
                  léelos cuidadosamente antes de utilizar nuestros servicios.
                </p>
                <h3 className="mt-4 text-xl font-semibold">1. Uso del sitio</h3>
                <p className="mb-3 text-neutral-300">
                  El contenido de este sitio es solo para fines informativos. No
                  se permite el uso indebido del contenido o diseño.
                </p>
                <h3 className="mt-4 text-xl font-semibold">
                  2. Propiedad intelectual
                </h3>
                <p className="text-neutral-300">
                  Todo el contenido, logotipos y material gráfico son propiedad
                  de SGOMEZ-DEV, salvo que se indique lo contrario.
                </p>
              </>
            )}

            {modalContent === "privacy" && (
              <>
                <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
                <p className="mb-3 text-neutral-300">
                  En SGOMEZ-DEV valoramos tu privacidad. Esta política describe
                  cómo recopilamos, usamos y protegemos tu información personal.
                </p>
                <h3 className="mt-4 text-xl font-semibold">
                  1. Información recopilada
                </h3>
                <p className="mb-3 text-neutral-300">
                  Podemos recopilar datos personales como tu nombre, correo
                  electrónico y mensaje cuando utilizas nuestro formulario de
                  contacto.
                </p>
                <h3 className="mt-4 text-xl font-semibold">
                  2. Uso de la información
                </h3>
                <p className="text-neutral-300">
                  Utilizamos la información para responder consultas y mejorar
                  nuestros servicios. Nunca vendemos tus datos a terceros.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
