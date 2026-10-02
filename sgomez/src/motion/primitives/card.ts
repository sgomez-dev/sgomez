import { MO_CARD_KEYFRAMES, entrance } from "./entrance";

/**
 * Tarjetas de la experiencia en lista vertical (bajo md). Desde md son una fila
 * con scroll propio, donde un view() del documento no tiene sentido, y en la
 * escena fijada su progreso se congelaría a medias: ahí no hay entrada.
 */
export const css = `${MO_CARD_KEYFRAMES}
@media (max-width: 47.99rem) {${entrance('[data-motion="card"]', "mo-card")}
}`;
