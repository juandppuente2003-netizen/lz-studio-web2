"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useState } from "react";
import { galleryImageUrl, type GalleryItem } from "@/lib/gallery";

const WHATSAPP_NUMBER = "528131194524";

function WhatsAppIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 2.67A13.2 13.2 0 0 0 4.65 22.5L2.8 29.3l6.95-1.82A13.19 13.19 0 1 0 16.04 2.67Zm0 23.97c-2.11 0-4.17-.57-5.96-1.65l-.43-.26-4.12 1.08 1.1-4.02-.28-.44a10.75 10.75 0 1 1 9.69 5.29Zm5.9-8.05c-.32-.16-1.91-.94-2.2-1.05-.3-.11-.52-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.37-.5-2.61-1.61a9.78 9.78 0 0 1-1.81-2.26c-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.21-.33.32-.54.11-.22.06-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.32-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.37c.16.21 2.3 3.51 5.56 4.92.78.33 1.38.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.91-.79 2.18-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.21-.62-.37Z" /></svg>;
}

export function PublicSite({ items, supabaseUrl }: { items: GalleryItem[]; supabaseUrl?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawDate = String(data.get("date") ?? "");
    const date = rawDate ? new Date(`${rawDate}T12:00:00`).toLocaleDateString("es-MX") : "por definir";
    const message = `Hola, soy ${data.get("name")}. Quiero cotizar ${data.get("quantity")} ${data.get("product")}. Fecha: ${date}. Detalles: ${data.get("details") || "Los comparto por mensaje"}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function chooseProduct(product: string) {
    const select = document.getElementById("product") as HTMLSelectElement | null;
    if (select) select.value = product;
  }

  const closeMenu = () => setMenuOpen(false);
  return <>
    <a className="skip" href="#contenido">Ir al contenido</a>
    <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="inicio"><div className="container nav"><a className="brand" href="#inicio"><span className="brand-mark">LZ</span><span>LZ Studio</span></a><nav className="nav-links" id="main-nav"><a onClick={closeMenu} href="#trabajo">Nuestro trabajo</a><a onClick={closeMenu} href="#productos">Productos</a><a onClick={closeMenu} href="#nosotros">Nosotros</a><a onClick={closeMenu} href="#contacto">Contacto</a><a onClick={closeMenu} className="nav-cta" href="#contacto">Hacer un pedido</a></nav><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen(!menuOpen)}><span className="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span></button></div></header>
    <main id="contenido">
      <section className="hero"><div className="hero-image"><img src="/assets/gorra-champions.jpeg" alt="Gorra personalizada Champions de LZ Studio" /></div><div className="container hero-inner"><div className="hero-copy"><p className="eyebrow">Personalizados en Nuevo León</p><h1>Tu idea. Nuestro trabajo.</h1><p className="hero-lead">Playeras, gorras y termos hechos para personas, equipos y negocios. Desde una pieza y con opciones de mayoreo.</p><div className="actions"><a className="btn btn-light" href="#trabajo">Ver nuestro trabajo</a><a className="btn btn-outline" href="#contacto">Contactar por WhatsApp</a></div></div><div className="hero-foot"><div><strong>DTF · Vinil · Acrílico · Láser</strong><span>Acabados elegidos según tu diseño</span></div><span className="scroll-mark">Desliza para conocer más ↓</span></div></div></section>
      <section className="work" id="trabajo"><div className="container"><div className="section-head reveal"><div><p className="eyebrow">Nuestro trabajo</p><h2>El producto habla primero.</h2></div><p>Trabajos reales realizados por LZ Studio. Selecciona cualquier fotografía para verla completa.</p></div><div className="work-grid">{items.map((item) => { const src = galleryImageUrl(item, supabaseUrl); return <figure className="work-card reveal" key={item.id}><a href={src} target="_blank" rel="noopener"><img src={src} loading="lazy" decoding="async" alt={item.title} /></a><figcaption className="work-label"><span>{item.title}</span><small>{item.category}</small></figcaption></figure>; })}</div></div></section>
      <section id="productos"><div className="container"><div className="section-head reveal"><div><p className="eyebrow">Catálogo de servicios</p><h2>Elige qué quieres personalizar.</h2></div><p>El precio final depende de cantidad, diseño, modelo disponible y fecha de entrega.</p></div><div className="catalog-grid"><CatalogCard num="01 / PLAYERAS" title="Playera de algodón" description="Para marcas, eventos, equipos o uso personal." tags={["DTF", "Vinil textil"]} product="Playeras" onChoose={chooseProduct} /><CatalogCard num="02 / DEPORTIVAS" title="Playera dry fit" description="Manga corta o larga para equipos y deporte." tags={["DTF", "Mayoreo"]} product="Playeras" onChoose={chooseProduct} /><CatalogCard num="03 / GORRAS" title="Placa acrílica" description="Grabada o con sticker UV según tu logotipo." tags={["Grabada", "Sticker UV"]} product="Gorras" onChoose={chooseProduct} featured /><CatalogCard num="04 / GORRAS" title="Vinil y alto relieve" description="Acabados que resaltan nombres, marcas y diseños." tags={["Vinil textil", "Alto relieve"]} product="Gorras" onChoose={chooseProduct} /><CatalogCard num="05 / TERMOS" title="Termo grabado" description="Personalización permanente con nombre o logotipo." tags={["Grabado láser", "16–30 oz"]} product="Termos" onChoose={chooseProduct} /><CatalogCard num="06 / VOLUMEN" title="Pedidos para equipos" description="Para negocios, escuelas, equipos y eventos." tags={["Mayoreo", "50+ piezas"]} onChoose={chooseProduct} /></div></div></section>
      <section className="finishes" id="acabados"><div className="container"><div className="section-head reveal"><div><p className="eyebrow">Cómo lo hacemos</p><h2>La técnica correcta para cada idea.</h2></div><p>Te orientamos según diseño, material, cantidad y uso.</p></div><div className="finish-grid"><Finish num="01" title="DTF" text="Impresión a todo color para playeras." /><Finish num="02" title="Vinil textil" text="Colores sólidos y acabados especiales." /><Finish num="03" title="Placa acrílica" text="Grabada o con sticker UV para gorras." /><Finish num="04" title="Grabado láser" text="Personalización permanente para termos y placas." /></div></div></section>
      <section id="nosotros"><div className="container about-grid"><div className="about-label reveal"><p className="eyebrow">LZ Studio</p><h2>Atención directa, trabajo a medida.</h2><figure className="studio-logo"><img src="/assets/logo-lz-studio.jpeg" loading="lazy" decoding="async" alt="Logotipo oficial de LZ Studio" /></figure></div><div className="about-copy reveal"><p>Somos un taller de personalizados en Escobedo, Nuevo León. Convertimos ideas en productos que representan a personas, equipos y negocios.</p><div className="values"><Value title="Desde una pieza" text="Pedidos personales y producción por volumen." /><Value title="Diseño revisado" text="Confirmamos composición y acabado antes de producir." /><Value title="Precio por cantidad" text="Menudeo, mayoreo y proyectos de 100+ piezas." /><Value title="Entrega acordada" text="Definimos anticipo y fecha desde el inicio." /></div></div></div></section>
      <section className="process"><div className="container"><div className="section-head reveal"><div><p className="eyebrow">Proceso</p><h2>Del mensaje a tus manos.</h2></div></div><div className="steps"><Step title="Cuéntanos tu idea" text="Producto, cantidad, fecha y diseño." /><Step title="Recibe cotización" text="Definimos material, técnica y precio final." /><Step title="Confirma pedido" text="50% de anticipo para iniciar producción." /><Step title="Recibe tu producto" text="Liquida al entregar o antes del envío." /></div><p className="small-note">Modelos y colores sujetos a disponibilidad. Los tiempos comienzan después de aprobar diseño y anticipo.</p></div></section>
      <section className="contact" id="contacto"><div className="container contact-grid"><div className="contact-copy reveal"><p className="eyebrow">Hablemos de tu pedido</p><h2>¿Qué quieres personalizar?</h2><p>Completa los datos básicos para preparar tu mensaje.</p><div className="contact-meta"><span>Escobedo, Nuevo León</span><span>Envíos a todo Nuevo León</span><span>Atención por WhatsApp</span></div></div><form className="quote-form reveal" onSubmit={submitQuote}><div className="field-grid"><div className="field"><label htmlFor="name">Tu nombre</label><input id="name" name="name" required /></div><div className="field"><label htmlFor="product">Producto</label><select id="product" name="product" required><option value="">Selecciona</option><option>Playeras</option><option>Gorras</option><option>Termos</option><option>Promocionales</option></select></div><div className="field"><label htmlFor="quantity">Cantidad</label><input id="quantity" name="quantity" type="number" min="1" required /></div><div className="field"><label htmlFor="date">Fecha requerida</label><input id="date" name="date" type="date" /></div><div className="field full"><label htmlFor="details">Detalles del diseño</label><textarea id="details" name="details" placeholder="Colores, acabado, tallas..."></textarea></div></div><button className="btn btn-light" type="submit">Preparar mensaje en WhatsApp</button><p className="form-note">No se realiza ningún cobro desde esta página.</p></form></div></section>
    </main>
    <a className="whatsapp-float" href="https://wa.me/528131194524?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20los%20productos%20de%20LZ%20Studio." target="_blank" rel="noopener noreferrer" aria-label="Contactar a LZ Studio por WhatsApp"><WhatsAppIcon /><span>WhatsApp</span></a>
    <footer><div className="container footer-row"><a className="brand" href="#inicio"><span className="brand-mark">LZ</span><span>LZ Studio</span></a><p>Personalizados hechos en Nuevo León.</p><a className="back-top" href="#inicio">Volver arriba ↑</a></div></footer>
  </>;
}

function CatalogCard({ num, title, description, tags, product, featured, onChoose }: { num: string; title: string; description: string; tags: string[]; product?: string; featured?: boolean; onChoose: (product: string) => void }) { return <article className={`catalog-card reveal ${featured ? "featured" : ""}`}><span className="catalog-num">{num}</span><div><h3>{title}</h3><p>{description}</p><div className="catalog-tags">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><a className="catalog-link" href="#contacto" onClick={() => product && onChoose(product)}>{product ? "Solicitar información" : "Hablar del proyecto"}</a></div></article>; }
function Finish({ num, title, text }: { num: string; title: string; text: string }) { return <article className="finish reveal"><span className="finish-num">{num}</span><div><h3>{title}</h3><p>{text}</p></div></article>; }
function Value({ title, text }: { title: string; text: string }) { return <div className="value"><h3>{title}</h3><p>{text}</p></div>; }
function Step({ title, text }: { title: string; text: string }) { return <article className="step reveal"><h3>{title}</h3><p>{text}</p></article>; }
