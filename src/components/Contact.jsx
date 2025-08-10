"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { Hourglass } from "ldrs/react";
import "ldrs/react/Hourglass.css";
import Alert from "@/constants/Alert";
import { Particles } from "@/constants/Particles";

export const Contact = () => {
  const formRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlertMessage = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          console.log("success");
          setIsLoading(false);
          showAlertMessage("success", "Haz enviado el mensaje.");
          formRef.current.reset();
        },
        (error) => {
          console.log("failed", error);
          showAlertMessage("danger", "Hubo un error, intentalo nuevamente.");
        }
      );
  };

  return (
    <section className="relative flex items-center c-space section-spacing">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={150}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      {showAlert && <Alert type={alertType} text={alertMessage} />}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-6 bg-primary rounded-xl shadow-lg flex flex-col items-center gap-3">
            <Hourglass size="50" bgOpacity="0.1" speed="1.75" color="white" />
            <p className="text-white text-lg">Enviando...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center max-w-md p-5 mx-auto border border-white/10 rounded-2xl bg-primary">
        <div className="flex flex-col items-start w-full gap-5 mb-10">
          <h2 className="text-heading">Contáctame</h2>
          <p className="font-normal text-neutral-400">
            Ya sea que quieres crear un proyecto nuevo, hacer una página web o
            mejorar un proyecto existente, estoy aquí para ayudar.
          </p>
        </div>
        <form ref={formRef} className="w-full" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="field-label">
              Nombre completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="field-input field-input-focus"
              placeholder="Tu nombre completo"
              autoComplete="name"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input field-input-focus"
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="message" className="field-label">
              Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="field-input field-input-focus"
              placeholder="Tu mensaje aquí..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-1 py-3 text-lg text-center rounded-md cursor-pointer bg-radial from-lavender to-royal hover-animation"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
};
