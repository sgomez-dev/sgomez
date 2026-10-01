"use client";

import { useSyncExternalStore } from "react";

const MAX = 80;

/** Trunca a 80 caracteres (con la elipsis incluida), sin partir pares sustitutos. */
export function formatRequestedPath(pathname: string): string {
  const chars = Array.from(pathname);
  return chars.length <= MAX ? pathname : `${chars.slice(0, MAX - 1).join("")}…`;
}

/** La ruta pedida, tal cual la ve el navegador. Vacía fuera del navegador. */
export function readRequestedPath(): string {
  try {
    return typeof location === "undefined" ? "" : formatRequestedPath(location.pathname);
  } catch {
    return "";
  }
}

/** React escapa el texto: la ruta nunca se interpreta como HTML. */
export function RequestedPathLabel({ label, path }: { label: string; path: string }) {
  return (
    <>
      {label}
      {path ? <span className="normal-case">{` · ${path}`}</span> : null}
    </>
  );
}

const subscribe = () => () => {};
const serverSnapshot = () => "";

/**
 * «Error 404 · {ruta}». La ruta se lee en el cliente: el molde es el mismo para
 * todas las URLs desconocidas. Sin JS, o en el HTML del servidor, solo «Error 404».
 */
export default function RequestedPath({ label }: { label: string }) {
  const path = useSyncExternalStore(subscribe, readRequestedPath, serverSnapshot);
  return <RequestedPathLabel label={label} path={path} />;
}
