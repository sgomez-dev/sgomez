import Image from "next/image";

/**
 * Retrato del hero (es el LCP, de ahí `priority`). La foto actual es un recorte
 * sobre un círculo azul marino y es provisional: la máscara radial deja el pelo
 * y la cara intactos y disuelve el borde del círculo, de modo que se lee como
 * un halo intencional en vez de un disco recortado.
 */
export default function Portrait({ alt, className = "" }: { alt: string; className?: string }) {
  return (
    <div
      data-motion="portrait"
      className={`aspect-square ${className}`}
      style={{
        WebkitMaskImage: "radial-gradient(closest-side, #000 76%, transparent 89%)",
        maskImage: "radial-gradient(closest-side, #000 76%, transparent 89%)",
      }}
    >
      <Image
        src="/Santiago_Gómez_de_la_Torre_Romero.png"
        alt={alt}
        width={1080}
        height={1080}
        priority
        sizes="(min-width:1024px) 40vw, 80vw"
        className="h-full w-full object-contain"
        style={{ filter: "saturate(.9) contrast(1.05)" }}
      />
    </div>
  );
}
