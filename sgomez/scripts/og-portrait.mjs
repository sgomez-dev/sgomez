// Regenera src/lib/seo/og-portrait.png a partir de la foto (4:5, 1080×1350): el cuadrado de la cara, sin
// transparencias (satori las pinta de blanco). La imagen Open Graph la recorta en círculo.
import sharp from "sharp";
await sharp("public/Santiago_Gómez_de_la_Torre_Romero.jpg")
  .extract({ left: 0, top: 60, width: 1080, height: 1080 })
  .resize(680, 680)
  .png({ compressionLevel: 9 })
  .toFile("src/lib/seo/og-portrait.png");
console.log("src/lib/seo/og-portrait.png");
