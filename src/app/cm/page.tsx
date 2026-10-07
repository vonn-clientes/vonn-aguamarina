import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicSite } from "@/lib/public-data";
import { SITE } from "@/lib/site";
import { groupByCategory, slugify, waLink } from "@/lib/seo";
import { CM_SECTIONS } from "@/lib/cm-links";
import { isCm } from "@/lib/cm-auth";
import { logoutCm } from "./actions";
import { LoginForm } from "@/components/cm/LoginForm";
import { CopyButton } from "@/components/cm/CopyButton";

export const metadata: Metadata = {
  title: "Acceso redes",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

// Arma el link con parámetros de seguimiento; respeta el #ancla al final.
const utm = (path: string, medium: string, campaign?: string) => {
  const [base, hash] = path.split("#");
  const q = `utm_source=instagram&utm_medium=${medium}${campaign ? `&utm_campaign=${campaign}` : ""}`;
  return `${SITE.url}${base}${base.includes("?") ? "&" : "?"}${q}${hash ? `#${hash}` : ""}`;
};

export default async function CmPage() {
  const logged = await isCm();

  if (!logged) {
    return (
      <div className="ag ag-cm">
        <main className="ag-cm-login">
          <Image src="/logo-aguamarina-oficial.png" alt="Aguamarina" width={240} height={84} className="ag-cm-logo" />
          <h1>Acceso para redes</h1>
          <p>Links, fotos y textos para publicar.</p>
          <LoginForm />
        </main>
      </div>
    );
  }

  const site = await getPublicSite();
  if (!site) notFound();
  const { content, services, products, promos } = site;
  const groups = groupByCategory(services);
  const wa = content?.whatsapp_number ?? null;

  return (
    <div className="ag ag-cm">
      <header className="ag-cm-top">
        <Image src="/logo-aguamarina-oficial.png" alt="Aguamarina" width={140} height={49} className="ag-cm-logo ag-cm-logo--sm" />
        <form action={logoutCm}>
          <button className="ag-more" type="submit">Salir</button>
        </form>
      </header>

      <main className="ag-wrap ag-cm-main">
        <h1>Panel de redes</h1>
        <p className="ag-lead">Todo lo que necesitás para publicar: links para historias y bio, fotos y textos de cada tratamiento.</p>

        <section>
          <h2>Links principales</h2>
          <ul className="ag-cm-list">
            {[
              { name: "Bio de Instagram (página principal)", url: utm("/", "bio") },
              ...(products.length ? [{ name: "Tienda", url: utm("/tienda", "bio", "tienda") }] : []),
              { name: "WhatsApp directo", url: waLink(wa, "Hola! Te escribo desde Instagram") },
            ].map((r) => (
              <li key={r.name}>
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.url}</span>
                </div>
                <CopyButton text={r.url} label="Copiar link" />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Secciones del sitio</h2>
          <ul className="ag-cm-list">
            {CM_SECTIONS.filter((x) => !x.onlyWithProducts || products.length > 0).map((x) => (
              <li key={x.slug}>
                <div>
                  <strong>{x.name}</strong>
                </div>
                <div className="ag-cm-actions">
                  <CopyButton text={utm(x.path, "story", x.slug)} label="Link para historia" />
                  <CopyButton text={utm(x.path, "post", x.slug)} label="Link para post" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {promos.length > 0 && (
          <section>
            <h2>Promociones</h2>
            <ul className="ag-cm-list">
              {promos.map((p) => (
                <li key={p.id} className="ag-cm-item">
                  <div>
                    <strong>{p.title}</strong>
                    <span>{p.items.join(" · ")}</span>
                  </div>
                  <div className="ag-cm-actions">
                    <CopyButton text={utm("/#promociones", "story", slugify(p.title))} label="Link para historia" />
                    <CopyButton text={utm("/#promociones", "post", slugify(p.title))} label="Link para post" />
                    <CopyButton text={`${p.title}\n${p.description ? `${p.description}\n` : ""}${p.items.map((i) => `• ${i}`).join("\n")}`} label="Copiar texto" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {groups.map(([category, items]) => (
          <section key={category}>
            <h2>{category}</h2>
            <ul className="ag-cm-list">
              {items.map((it) => {
                const path = `/tratamientos/${slugify(it.name)}`;
                const photos = [it.image_url, ...(it.gallery_urls ?? [])].filter(Boolean) as string[];
                return (
                  <li key={it.id} className="ag-cm-item">
                    <div>
                      <strong>{it.name}</strong>
                      {it.description && <span>{it.description}</span>}
                      <span className="ag-cm-photos">
                        {photos.length ? (
                          photos.map((p, i) => (
                            <a key={p} href={p} target="_blank" rel="noopener noreferrer" download>
                              Foto {i + 1}
                            </a>
                          ))
                        ) : (
                          <em>Todavía sin fotos</em>
                        )}
                      </span>
                    </div>
                    <div className="ag-cm-actions">
                      <CopyButton text={utm(path, "story", slugify(it.name))} label="Link para historia" />
                      <CopyButton text={utm(path, "post", slugify(it.name))} label="Link para post" />
                      {it.description && <CopyButton text={it.description} label="Copiar texto" />}
                      <a className="ag-more" href={path} target="_blank" rel="noopener noreferrer">Ver página</a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {products.length > 0 && (
          <section>
            <h2>Productos</h2>
            <ul className="ag-cm-list">
              {products.map((p) => (
                <li key={p.id} className="ag-cm-item">
                  <div>
                    <strong>{p.name}</strong>
                    {p.description && <span>{p.description}</span>}
                  </div>
                  <div className="ag-cm-actions">
                    <CopyButton text={utm(`/tienda/${slugify(p.name)}`, "story", slugify(p.name))} label="Link del producto" />
                    {p.description && <CopyButton text={p.description} label="Copiar texto" />}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
