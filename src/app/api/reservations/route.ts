import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, vehicule: true, paiements: true },
  });
  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const body = await req.json();
  const reservation = await prisma.reservation.create({ data: body });

  // Mettre à jour le statut du véhicule
  const statutVehicule = body.statut === "EN_COURS" ? "LOUE" : body.statut === "CONFIRMEE" ? "RESERVE" : undefined;
  if (statutVehicule) {
    await prisma.vehicule.update({ where: { id: body.vehiculeId }, data: { statut: statutVehicule } });
  }

  return NextResponse.json(reservation, { status: 201 });
}
