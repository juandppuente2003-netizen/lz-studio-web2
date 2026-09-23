import { DEFAULT_GALLERY, type GalleryItem } from "@/lib/gallery";
import { createClient } from "@/lib/supabase/server";
import { PublicSite } from "./public-site";

export const dynamic = "force-dynamic";

export default async function Home() {
  let items = DEFAULT_GALLERY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });
    if (data?.length) items = data as GalleryItem[];
  }

  return <PublicSite items={items} supabaseUrl={supabaseUrl} />;
}
