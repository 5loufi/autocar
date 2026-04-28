"use client";
import { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export function SignContratButton({ id, signe }: { id: string; signe: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/contrats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signe: !signe, dateSigne: !signe ? new Date() : null }),
      });
      router.refresh();
      toast.success(signe ? "Signature retirée" : "Contrat signé");
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  if (signe) {
    return (
      <button onClick={toggle} disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg hover:bg-emerald-500/15 transition-colors disabled:opacity-50">
        <CheckCircle className="w-3 h-3" /> Signé
      </button>
    );
  }

  return (
    <button onClick={toggle} disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/40 bg-foreground/[0.04] border border-foreground/[0.06] px-2.5 py-1 rounded-lg hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20 transition-colors disabled:opacity-50">
      <Clock className="w-3 h-3" />
      {loading ? "…" : "Signer"}
    </button>
  );
}
