import { prisma } from "@/lib/prisma";
import { VehiculesClient } from "./VehiculesClient";

export default async function VehiculesPage() {
  const vehicules = await prisma.vehicule.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reservations: true } } },
  });

  return <VehiculesClient vehicules={vehicules} />;
}
