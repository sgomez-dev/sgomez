import { MO_CARD_KEYFRAMES, entrance } from "./entrance";
import { magnetCss } from "./magnetic";

export { run } from "./magnetic";

/** Intenciones del contacto: suben escalonadas (`--i` 0 a 2) y son magnéticas. */
export const css = `${MO_CARD_KEYFRAMES}${entrance('[data-motion="intent"]', "mo-card")}${magnetCss}`;
