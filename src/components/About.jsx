"use client";

import { Card } from "@/constants/Card";
import { useRef } from "react";
import { Globe } from "./Globe";
import { CopyEmailButton } from "@/constants/CopyEmailButton";
import { Frameworks } from "@/constants/Frameworks";
import { useState } from "react";
import { FrameworksModal } from "@/constants/FrameworksModal";

export const About = () => {
  const grid2container = useRef();
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="c-space section-spacing">
      <h2 className="text-heading">Sobre mi</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[18rem] mt-12">
        <div className="flex items-end grid-default-color grid-1">
          <img
            src="/models/assets/coding-pov.png"
            className="absolute scale-[1.75] -rigth-[5rem] -top-[1rem] md:scale-[3] md:left-50 md:inset-y-10 lg:scale-[2.5]"
          />
          <div className="z-10">
            <p className="headtext">
              Hola, soy Santiago Gómez de la Torre Romero
            </p>
            <p className="subtext">
              Soy ingeniero informático con un fuerte compromiso por diseñar
              soluciones digitales que equilibren funcionalidad y diseño. Mi
              enfoque es contribuir proactivamente en proyectos de tecnología y
              desarrollo de software que generen impacto real.
            </p>
          </div>
          <div className="absolute inset-x-0 pointer-events-none -bottom-4 h-1/2 sm:h-1/3 bg-gradient-to-t from bg-indigo blur-sm"></div>
        </div>
        <div className="grid-default-color grid-2">
          <div
            ref={grid2container}
            className="flex items-center justify-center w-full h-full"
          >
            <p className="flex items-end text-5xl text-gray-500">CODEANDO</p>
            <Card
              style={{ rotate: "75deg", top: "30%", left: "20%" }}
              text="Desarrollo web"
              containerRef={grid2container}
            />
            <Card
              style={{ rotate: "-30deg", top: "60%", left: "45%" }}
              text="Soluciones digitales"
              containerRef={grid2container}
            />
            <Card
              style={{ rotate: "90deg", top: "30%", left: "70%" }}
              text="Innovación"
              containerRef={grid2container}
            />
            <Card
              style={{ rotate: "-45deg", top: "55%", left: "0%" }}
              text="Digitalización"
              containerRef={grid2container}
            />
            <Card
              style={{ rotate: "-45deg", top: "70%", left: "25%" }}
              image="/models/assets/sicons/sgomez-dev1.png"
              containerRef={grid2container}
            />
            <Card
              style={{ rotate: "30deg", top: "70%", left: "70%" }}
              image="/models/assets/sicons/sgomez-dev2.png"
              containerRef={grid2container}
            />
            <Card
              style={{ rotate: "-45deg", top: "5%", left: "10%" }}
              image="/models/assets/sicons/sgomez-dev3.PNG"
              containerRef={grid2container}
            />
          </div>
        </div>
        <div className="grid-black-color grid-3">
          <div className="z-10 w-[50%]">
            <p className="headtext">Zona horaria</p>
            <p className="subtext">
              Me encuentro en España. Estoy disponible para trabajar en remoto o
              en cualquier parte del mundo
            </p>
          </div>
          <figure className="absolute left-[30%] top-[10%]">
            <Globe />
          </figure>
        </div>
        <div className="grid-special-color grid-4">
          <div className="flex flex-col items-center justify-center gap-4 size-full">
            <p className="text-center headtext">
              ¿Quieres comenzar un proyecto juntos?
            </p>
            <CopyEmailButton />
          </div>
        </div>
        <div className="grid-default-color grid-5 relative">
          <div className="z-10 w-[50%]">
            <p className="headtext">Habilidades tecnológicas</p>
            <p className="subtext">
              Me especializo en una variedad de lenguajes y frameworks que me
              permiten crear aplicaciones escalables.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              Ver detalles
            </button>
          </div>
          <div className="absolute inset-y-0 md:inset-y-9 w-full h-full start-[50%] md:scale-125">
            <Frameworks />
          </div>
        </div>
      </div>

      {showModal && <FrameworksModal onClose={() => setShowModal(false)} />}
    </section>
  );
};
