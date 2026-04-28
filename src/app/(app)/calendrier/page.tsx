import { prisma } from "@/lib/prisma";
import { CalendrierClient } from "./CalendrierClient";

export default async function CalendrierPage() {
  const reservations = await prisma.reservation.findMany({
    where: { statut: { notIn: ["ANNULEE"] } },
    include: { client: true, vehicule: true },
    orderBy: { dateDepart: "asc" },
  });
  return <CalendrierClient reservations={reservations} />;
}
