import { useState, useRef, useEffect } from "react";
import { Bell, User, Settings, LogOut, Search, Calendar } from "lucide-react";
import { UseAuth } from "../../context/AuthContext";

export default function Navbar(): React.JSX.Element {
  const { user, logout } = UseAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user ? `${user.nom?.[0] ?? ""}`.toUpperCase() : "?";

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="h-16 flex items-center justify-between gap-6 px-6 bg-bg border-b border-border">
      {/* Recherche client */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle transition-colors group-focus-within:text-primary"
          />
          <input
            type="text"
            placeholder="Rechercher un client, un dossier..."
            className="w-full pl-10 pr-14 py-2.5 rounded-lg bg-bg-subtle border border-transparent text-sm text-text placeholder:text-text-subtle outline-none focus:bg-bg focus:border-primary-border focus:ring-4 focus:ring-primary-bg transition-all duration-150"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-bg text-[10px] font-medium text-text-subtle">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Date compacte */}
      <div className="hidden md:flex items-center gap-2 text-text-muted shrink-0 text-sm">
        <Calendar size={15} strokeWidth={2} />
        <span className="capitalize">{today}</span>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            className="relative p-2.5 rounded-lg text-text-muted hover:bg-bg-subtle hover:text-text-h outline-none focus-visible:ring-2 focus-visible:ring-primary-border transition-colors"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-danger ring-2 ring-bg" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-bg border border-border rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                <p className="text-sm font-semibold text-text-h">
                  Notifications
                </p>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-bg text-primary font-medium">
                  3 nouvelles
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto scrollbar-hide divide-y divide-border">
                <button className="w-full flex gap-3 px-4 py-3 hover:bg-bg-subtle transition-colors text-left">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-h font-medium">
                      Stock faible
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      Monture Ray-Ban Aviator — 3 unités restantes
                    </p>
                    <p className="text-[11px] text-text-subtle mt-1">
                      Il y a 12 min
                    </p>
                  </div>
                </button>

                <button className="w-full flex gap-3 px-4 py-3 hover:bg-bg-subtle transition-colors text-left">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-h font-medium">
                      Rappel client
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      Fatima Benali — renouvellement lentilles
                    </p>
                    <p className="text-[11px] text-text-subtle mt-1">
                      Il y a 1h
                    </p>
                  </div>
                </button>

                <button className="w-full flex gap-3 px-4 py-3 hover:bg-bg-subtle transition-colors text-left">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-h font-medium">
                      Devis transformé
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      Devis #089 converti en vente
                    </p>
                    <p className="text-[11px] text-text-subtle mt-1">
                      Il y a 3h
                    </p>
                  </div>
                </button>
              </div>

              <button className="w-full text-center text-xs font-medium text-primary py-2.5 border-t border-border hover:bg-primary-bg transition-colors">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Menu utilisateur */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-bg-subtle outline-none focus-visible:ring-2 focus-visible:ring-primary-border transition-colors"
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[13px] font-semibold shadow-sm">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success ring-2 ring-bg" />
            </div>

            <p className="text-sm font-medium text-text-h hidden sm:block leading-none">
              {user?.nom}
            </p>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2.5 w-60 bg-bg border border-border rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-bg-subtle">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-h truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-subtle transition-colors">
                  <User size={16} className="text-text-muted" />
                  Mon profil
                </button>

                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-bg-subtle transition-colors">
                  <Settings size={16} className="text-text-muted" />
                  Paramètres
                </button>
              </div>

              <div className="h-px bg-border" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
