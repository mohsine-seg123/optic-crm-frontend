import axios from "../api/axios";
import { type BestProduct, type DashboardOverview, type DevisConversion, type PaymentModesResponse, type RecentClient, type RecentSale } from "../interfaces/Dashbord.types";


export type MonthlyRevenueItem = {
  month: string;
  revenue: number;
  salesCount: number;
};


const Overview = async (): Promise<DashboardOverview> => {
  const response = await axios.get("/dashboard/overview");

  const data = response.data?.data;

  return {
    ventesTodayCount: data?.ventesTodayCount ?? 0,
    ventesMonthCount: data?.ventesMonthCount ?? 0,
    clientsCount: data?.clientsCount ?? 0,
    devisCount: data?.devisCount ?? 0,
    facturesPendingCount: data?.facturesPendingCount ?? 0,
    rappelsTodayCount: data?.rappelsTodayCount ?? 0,

    todayRevenue: Number(data?.ventesTodayAmount?._sum?.montantTotal ?? 0),

    monthRevenue: Number(data?.ventesMonthAmount?._sum?.montantTotal ?? 0),

    produitsStockFaible: data?.produitsStockFaible ?? [],
  };
};



const getBestProducts = async (): Promise<BestProduct[]> => {
  const { data } = await axios.get("dashboard/best-products");
  return data?.data?.bestProducts ?? [];
};


const getPendingFactures = async () => {
  const { data } = await axios.get("dashboard/pending-factures");
  return data?.data?.factures ?? [];
};


const getDevisConversion = async (): Promise<DevisConversion> => {
  const response = await axios.get("/dashboard/devis-conversion");

  const data = response.data?.data;

  return {
    devis: data?.devis ?? 0,
    devisConvertis: data?.devisConvertis ?? 0,
    tauxConversion: data?.tauxConversion ?? 0,
  };
};


const getPaymentModes = async (  period: "month" | "year" | "all" = "year",): Promise<PaymentModesResponse> => {
  const response = await axios.get(`/dashboard/payment-modes?period=${period}`);
  return response.data.data;
};



const getRecentClients = async (): Promise<RecentClient[]> => {
  const { data } = await axios.get("dashboard/recent-clients");
  return data?.data?.clients ?? [];
};



const getRecentSales = async (): Promise<RecentSale[]> => {
  const { data } = await axios.get("dashboard/recent-sales");
  return data?.data?.ventes ?? [];
};



const getMonthlyRevenue = async (
  year = new Date().getFullYear(),
): Promise<MonthlyRevenueItem[]> => {
  const response = await axios.get(`/dashboard/monthly-revenue?year=${year}`);
  console.log("response.data?.monthlyRevenue", response.data?.monthlyRevenue);
  return response.data.data?.monthlyRevenue ?? [];
};


export { Overview, getBestProducts, getPendingFactures, getDevisConversion, getPaymentModes,getRecentClients,getRecentSales, getMonthlyRevenue };