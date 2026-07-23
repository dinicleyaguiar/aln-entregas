import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALN Entregas",
    short_name: "ALN Entregas",
    description: "Consulta e gerenciamento de encomendas da ALN Entregas.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7f6",
    theme_color: "#0f766e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
