import { serializeJsonLd } from "./jsonld";

/** Un `<script type="application/ld+json">` con el grafo ya serializado y escapado. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
