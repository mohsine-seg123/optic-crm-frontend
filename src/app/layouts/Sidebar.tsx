import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Eye,
} from "lucide-react";

import SidebarSection from "./SidebarSection";
import { UseAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = UseAuth();

  return (
    <aside className="w-46 h-screen flex flex-col bg-bg-sidebar border-r border-border">
      {/* LOGO */}
      <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-border">
         <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">

       {user?.role === "admin" && (
        <SidebarSection
          title="Tableau de bord"
          icon={<LayoutDashboard size={16} />}
          items={[{ name: "Vue générale", path: "/" }]}
        />
        )}

        <SidebarSection
          title="CRM"
          icon={<Users size={16} />}
          items={[
            { name: "Clients", path: "/crm/clients" },
            { name: "Rappels", path: "/crm/rappels" },
            { name: "Mutuelles", path: "/crm/mutuelles" },
          ]}
        />

        <SidebarSection
          title="Gestion optique"
          icon={<Eye size={16} />}
          items={[
            { name: "Dossiers optiques", path: "/optique/dossiers" },
            { name: "Ordonnances", path: "/optique/ordonnances" },
            { name: "Examens de vue", path: "/optique/examens" },
          ]}
        />

        <SidebarSection
          title="Stock"
          icon={<Package size={16} />}
          items={[
            { name: "Produits", path: "/stock/produits" },
            { name: "Catégories", path: "/stock/categories" },
            { name: "Fournisseurs", path: "/stock/fournisseurs" },
            { name: "Bons de livraison", path: "/stock/livraisons" },
          ]}
        />

        <SidebarSection
          title="Ventes"
          icon={<ShoppingCart size={16} />}
          items={[
            { name: "Devis", path: "/sales/devis" },
            { name: "Ventes", path: "/sales/ventes" },
            { name: "Factures", path: "/sales/factures" },
          ]}
        />

        {user?.role === "admin" && (
          <>
            <div className="h-px bg-border mx-1" />
            <SidebarSection
              title="Administration"
              icon={<Settings size={16} />}
              items={[{ name: "Utilisateurs", path: "/users" }]}
            />
          </>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-text-muted hover:bg-danger-bg hover:text-danger transition-colors"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
