// Onglet « Commandes » de /admin : les commandes telles que le serveur les a
// vérifiées. Le montant affiché ici est celui qui fait foi pour le paiement.
import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface OrderLine {
  title: string;
  option: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  number: string;
  createdAt: string;
  customer: Record<string, string>;
  lines: OrderLine[];
  total: number;
  displayedTotal: number | null;
}

const euros = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;
const date = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' });

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? `Erreur ${response.status}`);
      setOrders(data.orders);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <p className="mr-auto text-sm text-neutral-600">
          Le montant affiché ici est recalculé par le serveur à partir de tes prix : c'est lui qui fait foi pour le
          paiement, même si l'e-mail de commande dit autre chose.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm hover:border-black"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Actualiser
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {!orders && !error && <Loader2 className="mx-auto animate-spin" />}
      {orders && orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Aucune commande pour l'instant.
        </div>
      )}

      <ul className="space-y-3">
        {orders?.map((order) => {
          const suspicious = order.displayedTotal !== null && Math.abs(order.displayedTotal - order.total) > 0.009;
          return (
            <li key={order.number} className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-mono text-sm font-semibold">{order.number}</span>
                <span className="text-sm text-neutral-500">{date(order.createdAt)}</span>
                <span className="ml-auto text-xl font-bold">{euros(order.total)}</span>
              </div>
              {suspicious && (
                <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  Le navigateur du client affichait {euros(order.displayedTotal as number)}. Le bon montant est{' '}
                  {euros(order.total)} (prix modifié entre-temps, ou tentative de fraude).
                </p>
              )}
              <ul className="mt-3 space-y-1 text-sm">
                {order.lines.map((line, index) => (
                  <li key={index} className="flex justify-between gap-4">
                    <span>
                      {line.title} <span className="text-neutral-500">({line.option})</span> × {line.quantity}
                    </span>
                    <span>{euros(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-700">
                <p className="font-medium">{order.customer.name}</p>
                <p>
                  <a className="underline" href={`mailto:${order.customer.email}?subject=Votre commande ${order.number}`}>
                    {order.customer.email}
                  </a>
                  {order.customer.phone && ` · ${order.customer.phone}`}
                </p>
                <p>
                  {order.customer.address}, {order.customer.postalCode} {order.customer.city}
                </p>
                {order.customer.message && <p className="mt-1 italic text-neutral-500">« {order.customer.message} »</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
