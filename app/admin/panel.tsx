"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, ImagePlus, LogOut, Save, Trash2 } from "lucide-react";
import { galleryImageUrl, type GalleryItem } from "@/lib/gallery";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["Gorras", "Playeras", "Termos", "Promocionales", "Otros"];

export function AdminPanel({ initialItems, initialError, supabaseUrl }: { initialItems: GalleryItem[]; initialError?: string; supabaseUrl: string }) {
  const supabase = createClient();
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState(initialError ?? "");
  const [busy, setBusy] = useState(false);
  const sorted = useMemo(() => [...items].sort((a, b) => a.sort_order - b.sort_order), [items]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const file = values.get("image");
    const title = String(values.get("title") ?? "").trim();
    const category = String(values.get("category") ?? "Otros");
    if (!(file instanceof File) || !file.size || !title) return setMessage("Selecciona una fotografía y escribe un título.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) return setMessage("Usa JPG, PNG o WebP de máximo 10 MB.");

    setBusy(true); setMessage("");
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); return setMessage(uploadError.message); }

    const sortOrder = Math.max(0, ...items.map((item) => item.sort_order)) + 10;
    const { data, error } = await supabase.from("gallery_items").insert({
      title, category, source_type: "storage", source_path: null,
      storage_path: storagePath, sort_order: sortOrder, visible: true,
    }).select().single();
    if (error) {
      await supabase.storage.from("gallery").remove([storagePath]);
      setBusy(false); return setMessage(error.message);
    }
    setItems((current) => [...current, data as GalleryItem]);
    form.reset(); setBusy(false); setMessage("Fotografía agregada correctamente.");
  }

  async function update(item: GalleryItem, changes: Partial<GalleryItem>) {
    const { data, error } = await supabase.from("gallery_items").update(changes).eq("id", item.id).select().single();
    if (error) return setMessage(error.message);
    setItems((current) => current.map((entry) => entry.id === item.id ? data as GalleryItem : entry));
    setMessage("Cambios guardados.");
  }

  async function remove(item: GalleryItem) {
    if (!window.confirm(`¿Eliminar “${item.title}”? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
    if (error) return setMessage(error.message);
    if (item.source_type === "storage" && item.storage_path) await supabase.storage.from("gallery").remove([item.storage_path]);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setMessage("Fotografía eliminada.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return <div className="admin-content">
    <form className="upload-card" onSubmit={upload}><div className="upload-title"><ImagePlus aria-hidden="true" /><div><h2>Agregar trabajo</h2><p>JPG, PNG o WebP · máximo 10 MB</p></div></div><div className="upload-grid"><div><label htmlFor="image">Fotografía</label><input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></div><div><label htmlFor="title">Título</label><input id="title" name="title" maxLength={100} placeholder="Ej. Gorra con placa grabada" required /></div><div><label htmlFor="category">Categoría</label><select id="category" name="category" defaultValue="Gorras">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div><button className="admin-button admin-button-light" disabled={busy}>{busy ? "Subiendo…" : "Subir fotografía"}</button></div></form>
    <div className="admin-toolbar"><p aria-live="polite">{message || `${items.length} fotografías en la galería`}</p><button className="admin-button admin-button-outline" onClick={signOut}><LogOut /> Cerrar sesión</button></div>
    <div className="gallery-admin-list">{sorted.map((item) => <GalleryRow key={item.id} item={item} src={galleryImageUrl(item, supabaseUrl)} onUpdate={update} onRemove={remove} />)}{!items.length && <div className="admin-empty"><ImagePlus /><h2>Tu galería está vacía</h2><p>Sube la primera fotografía con el formulario.</p></div>}</div>
  </div>;
}

function GalleryRow({ item, src, onUpdate, onRemove }: { item: GalleryItem; src: string; onUpdate: (item: GalleryItem, changes: Partial<GalleryItem>) => Promise<void>; onRemove: (item: GalleryItem) => Promise<void> }) {
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState(item.category);
  const [order, setOrder] = useState(String(item.sort_order));
  return <article className={`gallery-admin-row ${item.visible ? "" : "is-hidden"}`}><img src={src} alt="" /><div className="gallery-admin-fields"><div><label htmlFor={`title-${item.id}`}>Título</label><input id={`title-${item.id}`} value={title} onChange={(e) => setTitle(e.target.value)} /></div><div><label htmlFor={`category-${item.id}`}>Categoría</label><select id={`category-${item.id}`} value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></div><div><label htmlFor={`order-${item.id}`}>Orden</label><input id={`order-${item.id}`} type="number" min="0" value={order} onChange={(e) => setOrder(e.target.value)} /></div></div><div className="gallery-admin-actions"><button className="visibility-control" onClick={() => onUpdate(item, { visible: !item.visible })}>{item.visible ? <Eye /> : <EyeOff />} {item.visible ? "Visible" : "Oculta"}</button><button className="admin-button admin-button-outline" onClick={() => onUpdate(item, { title, category, sort_order: Number(order) })}><Save /> Guardar</button><button className="admin-button admin-button-danger" onClick={() => onRemove(item)}><Trash2 /> Eliminar</button></div></article>;
}
