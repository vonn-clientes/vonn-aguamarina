"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkAlbum } from "@/lib/trabajos";

const EVERY_MS = 2000;

function useReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(q.matches);
    const on = () => setReduce(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return reduce;
}

// Pasa solo la foto actual y la siguiente (las demás no se descargan hasta que toca su turno).
// Cada foto se muestra entera, vertical u horizontal, sobre su propio fondo desenfocado.
function Stage({ album, index, sizes, priority }: { album: WorkAlbum; index: number; sizes: string; priority?: boolean }) {
  const n = album.photos.length;
  return (
    <div className="ag-stage">
      {album.photos.map((p, k) => {
        const near = k === index || k === (index + 1) % n;
        if (!near) return null;
        return (
          <div key={p.src} className={`ag-stage__slide${k === index ? " is-on" : ""}`} aria-hidden={k !== index}>
            <Image src={p.src} alt="" fill sizes={sizes} quality={40} className="ag-stage__bg" aria-hidden />
            <Image
              src={p.src}
              alt={k === index ? p.alt : ""}
              fill
              sizes={sizes}
              quality={75}
              className="ag-stage__img"
              priority={priority && k === 0}
              data-orientation={p.width >= p.height ? "horizontal" : "vertical"}
            />
          </div>
        );
      })}
    </div>
  );
}

function AlbumCard({ album, onOpen }: { album: WorkAlbum; onOpen: () => void }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const n = album.photos.length;
  useEffect(() => {
    if (n < 2 || reduce) return;
    const t = setInterval(() => setI((c) => (c + 1) % n), EVERY_MS);
    return () => clearInterval(t);
  }, [n, reduce]);
  return (
    <button type="button" className="ag-album" onClick={onOpen} aria-label={`Abrir la carpeta ${album.title}, ${n} fotos`}>
      <span className="ag-album__stack" aria-hidden="true" />
      <span className="ag-album__cover">
        <Stage album={album} index={i} sizes="(max-width: 700px) 86vw, 420px" priority />
        <span className="ag-album__label">
          <strong>{album.title}</strong>
          <span>
            {album.caption} · {n} fotos
          </span>
        </span>
      </span>
    </button>
  );
}

function Viewer({ album, start, onClose }: { album: WorkAlbum; start: number; onClose: () => void }) {
  const photos = album.photos;
  const n = photos.length;
  const reduce = useReducedMotion();
  const [i, setI] = useState(start);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);

  const go = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);

  // Pasa sola cada 2 segundos; se frena mientras se mantiene apretado o con el botón de pausa.
  useEffect(() => {
    if (n < 2 || reduce || !playing || hold) return;
    const t = setInterval(() => setI((c) => (c + 1) % n), EVERY_MS);
    return () => clearInterval(t);
  }, [n, reduce, playing, hold, i]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [go, onClose]);

  const running = playing && !reduce && n > 1;
  return (
    <div className="ag-viewer" role="dialog" aria-modal="true" aria-label={album.title}>
      <div className="ag-viewer__top">
        <div>
          <strong>{album.title}</strong>
          <span>{album.caption}</span>
        </div>
        <button ref={closeRef} type="button" className="ag-viewer__close" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className="ag-viewer__stage"
        onPointerDown={(e) => {
          startX.current = e.clientX;
          setHold(true);
        }}
        onPointerUp={(e) => {
          if (startX.current != null) {
            const dx = e.clientX - startX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          }
          startX.current = null;
          setHold(false);
        }}
        onPointerCancel={() => {
          startX.current = null;
          setHold(false);
        }}
      >
        <Stage album={album} index={i} sizes="(max-width: 900px) 100vw, 900px" priority />
        {n > 1 && (
          <>
            <button type="button" className="ag-viewer__nav ag-viewer__nav--prev" onClick={() => go(-1)} aria-label="Foto anterior">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="ag-viewer__nav ag-viewer__nav--next" onClick={() => go(1)} aria-label="Foto siguiente">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </>
        )}
      </div>

      <div className="ag-viewer__bar">
        <button type="button" className="ag-viewer__play" onClick={() => setPlaying((p) => !p)} aria-label={running ? "Pausar" : "Reproducir"} disabled={n < 2}>
          {running ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>
          )}
        </button>
        <div className="ag-viewer__dots" role="tablist" aria-label="Elegir foto">
          {photos.map((p, k) => (
            <button key={p.src} role="tab" aria-selected={k === i} aria-label={`Foto ${k + 1} de ${n}`} className={k === i ? "on" : ""} onClick={() => setI(k)} />
          ))}
        </div>
        <span className="ag-viewer__count" aria-live="off">
          {i + 1} / {n}
        </span>
      </div>
    </div>
  );
}

export function Works({ albums }: { albums: WorkAlbum[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const album = albums.find((a) => a.slug === open) ?? null;
  const close = useCallback(() => setOpen(null), []);
  if (!albums.length) return null;
  return (
    <>
      <ul className={`ag-albums${albums.length === 1 ? " ag-albums--one" : ""}`}>
        {albums.map((a) => (
          <li key={a.slug}>
            <AlbumCard album={a} onOpen={() => setOpen(a.slug)} />
          </li>
        ))}
      </ul>
      {album && <Viewer album={album} start={0} onClose={close} />}
    </>
  );
}
