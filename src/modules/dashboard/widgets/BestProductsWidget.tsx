import {
  Package,
  TrendingUp,
  Barcode,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

import type { BestProduct } from "../../../interfaces/Dashbord.types";

type Props = {
  products: BestProduct[];
};

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function getStockStatus(stockActuel: number, stockMinimum: number) {
  if (stockActuel <= stockMinimum) {
    return {
      label: "Stock faible",
      className: "bg-danger-bg text-danger",
      icon: <AlertTriangle size={12} />,
    };
  }

  return {
    label: "Stock OK",
    className: "bg-success-bg text-success",
    icon: <CheckCircle2 size={12} />,
  };
}

export default function BestProductsWidget({
  products,
}: Props): React.JSX.Element {
  const visibleProducts = products.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-bg">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-text-h">
            Produits les plus vendus
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            Classement selon la quantité vendue
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
          <TrendingUp size={18} />
        </div>
      </div>

      {/* EMPTY */}
      {visibleProducts.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
            <Package size={21} />
          </div>

          <p className="text-sm font-medium text-text-h">Aucun produit vendu</p>

          <p className="mt-1 text-xs text-text-muted">
            Les produits les plus vendus apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleProducts.map((item, index) => {
            const product = item.produit;
            const stockStatus = getStockStatus(
              product.stockActuel,
              product.stockMinimum,
            );

            return (
              <div
                key={product.id}
                className="group flex items-center gap-3 px-5 py-3 transition hover:bg-bg-subtle"
              >
                {/* RANK */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-subtle text-sm font-semibold text-text-h">
                  #{index + 1}
                </div>

                {/* PRODUCT INFO */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-h">
                      {product.designation}
                    </p>

                    <span className="hidden rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-medium text-primary sm:inline-flex">
                      {product.categorie.libelle}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                    <span>
                      {product.marque} · {product.modele}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Barcode size={12} />
                      {product.codeBarre}
                    </span>
                  </div>
                </div>

                {/* SALES */}
                <div className="hidden min-w-[120px] text-right md:block">
                  <p className="text-sm font-semibold text-text-h">
                    {item.quantiteVendue} vendus
                  </p>

                  <p className="mt-0.5 text-[11px] text-text-muted">
                    {formatPrice(product.prixVente)}
                  </p>
                </div>

                {/* STOCK */}
                <div className="hidden min-w-[120px] text-right lg:block">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${stockStatus.className}`}
                  >
                    {stockStatus.icon}
                    {stockStatus.label}
                  </span>

                  <p className="mt-1 inline-flex items-center justify-end gap-1 text-[11px] text-text-muted">
                    <Boxes size={12} />
                    {product.stockActuel} en stock
                  </p>
                </div>

                {/* ACTION */}
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-subtle transition group-hover:bg-bg group-hover:text-primary"
                  title="Voir produit"
                >
                  <ArrowUpRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      {products.length > 5 && (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            className="text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Voir tous les produits
          </button>
        </div>
      )}
    </div>
  );
}
