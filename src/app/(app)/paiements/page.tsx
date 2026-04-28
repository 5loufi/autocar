import { prisma } from "@/lib/prisma";
import { PaiementsClient } from "./PaiementsClient";

export default async function PaiementsPage() {
  const [paiements, reservations] = await Promise.all([
    prisma.paiement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reservation: { include: { client: true, vehicule: true } },
      },
    }),
    prisma.reservation.findMany({
      where: { statut: { in: ["EN_ATTENTE", "CONFIRMEE", "EN_COURS"] } },
      include: { client: true, vehicule: true },
    }),
  ]);
  return <PaiementsClient paiements={paiements} reservations={reservations} />;
}
