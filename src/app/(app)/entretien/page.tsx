import { prisma } from "@/lib/prisma";
import { EntretienClient } from "./EntretienClient";

export default async function EntretienPage() {
  const [entretiens, vehicules] = await Promise.all([
    prisma.entretien.findMany({
      orderBy: { date: "desc" },
      include: { vehicule: true },
    }),
    prisma.vehicule.findMany({ orderBy: { marque: "asc" } }),
  ]);
  return <EntretienClient entretiens={entretiens} vehicules={vehicules} />;
}
