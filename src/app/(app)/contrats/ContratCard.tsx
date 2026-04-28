"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function ContratCard({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function generer() {
    setLoading(true);
    try {
      await fetch("/api/contrats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={generer} loading={loading}>
      <FilePlus className="w-3.5 h-3.5" /> Générer
    </Button>
  );
}
