// Regenera src/lib/seo/og-portrait.png a partir de la foto: el círculo azul (de 64 a 1016 px en la foto de 1080)
// aplanado sobre su mismo azul. La imagen Open Graph la usa en vez de la foto con transparencias.
import sharp from "sharp";
await sharp("public/Santiago_Gómez_de_la_Torre_Romero.png")
  .extract({ left: 64, top: 64, width: 952, height: 952 })
  .flatten({ background: "#29235f" })
  .resize(680, 680)
  .png({ compressionLevel: 9 })
  .toFile("src/lib/seo/og-portrait.png");
console.log("src/lib/seo/og-portrait.png");
