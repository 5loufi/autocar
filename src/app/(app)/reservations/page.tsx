import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "./ReservationsClient";

export default async function ReservationsPage() {
  const [reservations, vehicules, clients] = await Promise.all([
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        vehicule: true,
        paiements: true,
      },
    }),
    prisma.vehicule.findMany({ orderBy: { marque: "asc" } }),
    prisma.client.findMany({ orderBy: { nom: "asc" } }),
  ]);
  return <ReservationsClient reservations={reservations} vehicules={vehicules} clients={clients} />;
}
