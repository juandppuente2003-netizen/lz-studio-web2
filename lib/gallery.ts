export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  source_type: "static" | "storage";
  source_path: string | null;
  storage_path: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
};

export const DEFAULT_GALLERY: GalleryItem[] = [
  ["gorra-caballo-roja", "Gorra con placa personalizada", "Gorras", "/assets/gorra-caballo-roja.jpeg"],
  ["playeras-longhorns", "Pedido de playeras deportivas", "Playeras", "/assets/playeras-longhorns.jpeg"],
  ["gorra-aguila", "Gorra con acabado a color", "Gorras", "/assets/gorra-aguila.jpeg"],
  ["playera-shadow-football", "Playera deportiva personalizada", "Playeras", "/assets/playera-shadow-football.jpeg"],
  ["gorra-niners", "Gorra con placa y sticker", "Gorras", "/assets/gorra-niners.jpeg"],
  ["playera-buzz", "Playera con impresión DTF", "Playeras", "/assets/playera-buzz.jpeg"],
  ["gorra-yuchai-negra", "Gorra personalizada en vinil", "Gorras", "/assets/gorra-yuchai-negra.jpeg"],
  ["gorra-yuchai-trucker", "Gorra trucker personalizada", "Gorras", "/assets/gorra-yuchai-trucker.jpeg"],
].map(([id, title, category, sourcePath], index) => ({
  id, title, category, source_type: "static", source_path: sourcePath,
  storage_path: null, sort_order: (index + 1) * 10, visible: true,
  created_at: "2026-09-23T00:00:00.000Z",
}));

export function galleryImageUrl(item: GalleryItem, supabaseUrl?: string) {
  if (item.source_type === "storage" && item.storage_path && supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/gallery/${item.storage_path.split("/").map(encodeURIComponent).join("/")}`;
  }
  return item.source_path ?? "";
}
