import { useState } from "react";
import { Mail, Lock, LogIn, Users, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../context/AuthContext";

export default function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();

  const { login } = UseAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      if (loggedUser.role === "admin") {
        navigate("/");
      } else {
        navigate("/crm/clients");
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Email ou mot de passe incorrect",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ============ LEFT — Brand panel (hidden on mobile) ============ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Decorative lens pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="lens-pattern"
                x="0"
                y="0"
                width="70"
                height="70"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="35"
                  cy="35"
                  r="14"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.8"
                />
                <circle cx="35" cy="35" r="5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lens-pattern)" />
          </svg>
        </div>

        {/* Big decorative lens bottom-right */}
        <div className="absolute -right-32 -bottom-32 opacity-[0.15] pointer-events-none">
          <svg width="500" height="500" viewBox="0 0 500 500">
            <circle
              cx="250"
              cy="250"
              r="220"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx="250"
              cy="250"
              r="140"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="250" cy="250" r="70" fill="white" fillOpacity="0.4" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo top */}
          <div className="flex items-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="18" cy="18" r="14" stroke="white" strokeWidth="2.2" />
              <circle cx="18" cy="18" r="6" fill="white" />
              <circle
                cx="18"
                cy="18"
                r="3"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="1"
              />
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-tight">
                OptaGest
              </span>
              <span className="text-[9px] tracking-[0.15em] uppercase opacity-70 leading-none mt-0.5">
                Gestion optique
              </span>
            </div>
          </div>

          {/* Middle content */}
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold leading-[1.15] tracking-tight">
              La gestion de votre magasin, simplifiée.
            </h2>
            <p className="text-white/80 text-base leading-relaxed">
              Clients, ordonnances, stock, devis et facturation réunis dans une
              seule interface pensée pour les opticiens.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <span className="text-sm text-white/90">
                  Gestion CRM & fidélité clients
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <span className="text-sm text-white/90">
                  Ordonnances et examens de vue
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Package size={18} />
                </div>
                <span className="text-sm text-white/90">
                  Stock, devis et factures en temps réel
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-white/60">
            © 2026 OptaGest
          </p>
        </div>
      </div>

      {/* ============ RIGHT — Form ============ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo (visible only when left panel is hidden) */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary-bg text-primary flex items-center justify-center mb-4">
              <svg
                width="30"
                height="30"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <circle cx="18" cy="18" r="6" fill="currentColor" />
                <circle
                  cx="18"
                  cy="18"
                  r="3"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-h tracking-tight">
              Opta<span className="text-primary">Gest</span>
            </h1>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-h tracking-tight">
              Bon retour
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Connectez-vous pour accéder à votre espace de gestion.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-danger-bg text-danger text-sm border border-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@optagest.com"
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-border bg-white outline-none text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text">
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-border bg-white outline-none text-text placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                "Connexion..."
              ) : (
                <>
                  <LogIn size={18} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-8 lg:hidden">
            © 2026 OptaGest
          </p>
        </div>
      </div>
    </div>
  );
}
