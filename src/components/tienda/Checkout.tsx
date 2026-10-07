"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { clearCart, setQty, useCart } from "@/lib/cart";
import { placeOrder } from "@/app/tienda/actions";

export type CheckoutProduct = { id: string; name: string; price: number; image_url: string | null };

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

export function Checkout({
  products,
  alias,
  holder,
}: {
  products: CheckoutProduct[];
  alias: string;
  holder: string | null;
}) {
  const cart = useCart();
  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<{ code: string; total: number; waUrl: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const lines = cart
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.id) }))
    .filter((l): l is typeof l & { product: CheckoutProduct } => !!l.product);
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  if (done) {
    return (
      <div className="ag-co-done">
        <h2 className="ag-h2">¡Casi listo!</h2>
        <p className="ag-lead">
          Guardamos tu pedido #{done.code}. Último paso: mandanos el detalle y el comprobante de la transferencia por
          WhatsApp para que Ingrid lo confirme.
        </p>
        <a className="ag-btn" href={done.waUrl} target="_blank" rel="noopener noreferrer">
          Terminar la compra por WhatsApp
        </a>
        <p className="ag-co-note">Se abre un mensaje con tu pedido ya escrito. Adjuntá ahí la captura o el PDF del comprobante.</p>
        <Link className="ag-more" href="/tienda">
          Seguir mirando la tienda
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="ag-co-done">
        <h2 className="ag-h2">Tu carrito está vacío</h2>
        <p className="ag-lead">Elegí tus productos y volvé acá para pagar.</p>
        <Link className="ag-btn" href="/tienda">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  async function copyAlias() {
    try {
      await navigator.clipboard.writeText(alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* si no se puede copiar, el alias queda visible para copiarlo a mano */
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await placeOrder({
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        name,
        dni,
        phone,
        website,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clearCart();
      setDone({ code: res.code, total: res.total, waUrl: res.waUrl });
    });
  }

  return (
    <form className="ag-co" onSubmit={submit}>
      <section className="ag-co__box" aria-labelledby="co-items">
        <h2 className="ag-co__h" id="co-items">Tu pedido</h2>
        <ul className="ag-co__lines">
          {lines.map((l) => (
            <li key={l.id}>
              <div className="ag-co__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.product.image_url ? <img src={l.product.image_url} alt="" width={64} height={64} /> : null}
              </div>
              <div className="ag-co__info">
                <p className="ag-co__name">{l.product.name}</p>
                <p className="ag-co__unit">{money(l.product.price)} c/u</p>
              </div>
              <div className="ag-qty" role="group" aria-label={`Cantidad de ${l.product.name}`}>
                <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Quitar uno">−</button>
                <span aria-live="polite">{l.qty}</span>
                <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Agregar uno">+</button>
              </div>
              <p className="ag-co__sub">{money(l.product.price * l.qty)}</p>
            </li>
          ))}
        </ul>
        <p className="ag-co__total">
          <span>Total</span>
          <strong>{money(total)}</strong>
        </p>
        <p className="ag-co-note">Retirás tu compra en el gabinete (Lorenzo Sartorio 784).</p>
      </section>

      <section className="ag-co__box" aria-labelledby="co-datos">
        <h2 className="ag-co__h" id="co-datos">Tus datos</h2>
        <label className="ag-lab">
          Nombre y apellido
          <input className="ag-in" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>
        <label className="ag-lab">
          DNI
          <input className="ag-in" value={dni} onChange={(e) => setDni(e.target.value)} inputMode="numeric" autoComplete="off" required />
        </label>
        <label className="ag-lab">
          WhatsApp
          <input className="ag-in" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="Ej: 3442 123456" required />
        </label>
        <input
          className="ag-trap"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </section>

      <section className="ag-co__box" aria-labelledby="co-pago">
        <h2 className="ag-co__h" id="co-pago">Pagá por transferencia</h2>
        <ol className="ag-co__steps">
          <li>Abrí tu app del banco o billetera.</li>
          <li>
            Transferí <strong>{money(total)}</strong> a este alias:
          </li>
        </ol>
        <div className="ag-alias">
          <div>
            <p className="ag-alias__v">{alias}</p>
            {holder && <p className="ag-alias__h">Titular: {holder}</p>}
          </div>
          <button type="button" className="ag-btn ag-btn--ghost ag-btn--small" onClick={copyAlias}>
            {copied ? "¡Copiado!" : "Copiar alias"}
          </button>
        </div>
        <p className="ag-co-note">Cuando termines, tocá el botón. Guardamos tu pedido y te llevamos a WhatsApp para enviar el comprobante.</p>
        {error && (
          <p className="ag-co-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="ag-btn ag-co__go" disabled={pending}>
          {pending ? "Guardando tu pedido…" : "Ya transferí"}
        </button>
      </section>
    </form>
  );
}
