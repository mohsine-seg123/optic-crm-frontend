import { AlertTriangle } from "lucide-react";

type Props = {
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-bg rounded-2xl shadow-xl ring-1 ring-black/5 p-5">
        <div className="w-10 h-10 rounded-full bg-danger-bg flex items-center justify-center mb-4">
          <AlertTriangle size={19} className="text-danger" />
        </div>

        <h3 className="text-base font-semibold text-text-h mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted mb-5">{description}</p>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-text hover:bg-bg-subtle transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-danger text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
