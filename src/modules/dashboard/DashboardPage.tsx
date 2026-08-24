import { useEffect, useState } from "react";
import RevenueChart from "./widgets/RevenueChart";
import { getMonthlyRevenue, Overview,getRecentClients, getRecentSales, type MonthlyRevenueItem, getBestProducts, getDevisConversion, getPendingFactures,} from "../../services/DashbordService"
import PaymentModesChart from "./widgets/PaymentModesChart";
import RecentClientsWidget from "./widgets/RecentClientsWidget";

import {getPaymentModes} from "../../services/DashbordService";
import type { BestProduct, DashboardOverview, DevisConversion, PaymentModeItem, PendingFacture, RecentClient, RecentSale } from "../../interfaces/Dashbord.types";
import RecentSalesWidget from "./widgets/RecentSalesWidget";
import OverviewCards from "./widgets/OverviewCards";
import BestProductsWidget from "./widgets/BestProductsWidget";
import PendingFacturesWidget from "./widgets/PendingFacturesWidget";
import DevisConversionWidget from "./widgets/DevisConversionWidget";

export default function DashboardPage(): React.JSX.Element {

  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>([],);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [paymentModes, setPaymentModes] = useState<PaymentModeItem[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [bestProducts, setBestProducts] = useState<BestProduct[]>([]);
  const [pendingFactures, setPendingFactures] = useState<PendingFacture[]>([]);
  const [devisConversion, setDevisConversion] =useState<DevisConversion | null>(null);
  const [loading, setLoading] = useState(true);



 useEffect(() => {
   const fetchDashboardData = async () => {
     try {
       setLoading(true);

       const [
         revenue,
         paymentData,
         clientsData,
         salesData,
         overviewData,
         bestProductsData,
         pendingFacturesData,
         devisConversionData,
       ] = await Promise.all([
         getMonthlyRevenue(2026),
         getPaymentModes("all"),
         getRecentClients(),
         getRecentSales(),
         Overview(),
         getBestProducts(),
         getPendingFactures(),
         getDevisConversion(),
       ]);

       setMonthlyRevenue(revenue);
       setPaymentModes(paymentData.paymentModes);
       setPaymentTotal(paymentData.totalAmount);
       setRecentClients(clientsData);
       setRecentSales(salesData);
       setOverview(overviewData);
       setBestProducts(bestProductsData);
       setPendingFactures(pendingFacturesData);
       setDevisConversion(devisConversionData);
     } catch (error) {
       console.error("Dashboard data error:", error);

       setMonthlyRevenue([]);
       setPaymentModes([]);
       setPaymentTotal(0);
       setRecentClients([]);
       setBestProducts([]);
       setPendingFactures([]);
       setDevisConversion(null);
     } finally {
       setLoading(false);
     }
   };

   fetchDashboardData();
 }, []);
  


  return (
    <div className="min-h-screen bg-bg-subtle">
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-2 md:px-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
              Vue générale
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Suivez l’activité commerciale, les ventes, les rappels et la santé
              du stock.
            </p>
          </div>

          <div className="rounded-xl bg-bg-subtle px-4 py-3 text-sm text-text-muted">
            Aujourd’hui ·{" "}
            <span className="font-medium text-text-h">
              {new Date().toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-border bg-bg"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="h-96 animate-pulse rounded-2xl border border-border bg-bg xl:col-span-8" />
              <div className="h-96 animate-pulse rounded-2xl border border-border bg-bg xl:col-span-4" />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="h-80 animate-pulse rounded-2xl border border-border bg-bg" />
              <div className="h-80 animate-pulse rounded-2xl border border-border bg-bg" />
            </div>
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
            <section>
              <OverviewCards overview={overview} />
            </section>

            {/* PERFORMANCE */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Performance commerciale
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8">
                  <RevenueChart data={monthlyRevenue} />
                </div>

                <div className="xl:col-span-4">
                  <DevisConversionWidget conversion={devisConversion} />
                </div>
              </div>
            </section>

            {/* ANALYSE DES VENTES */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Analyse des ventes
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <PaymentModesChart
                  data={paymentModes}
                  totalAmount={paymentTotal}
                />

                <BestProductsWidget products={bestProducts} />
              </div>
            </section>

            {/* SUIVI OPÉRATIONNEL */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Suivi opérationnel
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <PendingFacturesWidget factures={pendingFactures} />
                <RecentSalesWidget ventes={recentSales} />
              </div>
            </section>

            {/* CLIENTS */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Activité client
                </h2>
              </div>

              <RecentClientsWidget clients={recentClients} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
