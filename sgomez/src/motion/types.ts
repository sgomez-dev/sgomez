/** Engancha el movimiento a un elemento pintado por el servidor. Lo que devuelve lo deja como estaba. */
export type Primitive = (el: HTMLElement) => (() => void) | void;
