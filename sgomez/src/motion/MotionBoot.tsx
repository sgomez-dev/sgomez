import { MOTION_BOOT_SCRIPT } from "./boot";

/** Script en línea del <head>. Vive aquí y no en el layout: el layout no inyecta HTML en bruto. */
export default function MotionBoot() {
  return <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />;
}
