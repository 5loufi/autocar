import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const reservation = await prisma.reservation.update({ where: { id }, data: body });

  if (body.statut) {
    const statutMap: Record<string, string> = {
      EN_COURS: "LOUE", CONFIRMEE: "RESERVE", TERMINEE: "DISPONIBLE", ANNULEE: "DISPONIBLE",
    };
    const statut = statutMap[body.statut];
    if (statut) {
      await prisma.vehicule.update({ where: { id: reservation.vehiculeId }, data: { statut } });
    }
  }

  return NextResponse.json(reservation);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (reservation) {
    await prisma.vehicule.update({ where: { id: reservation.vehiculeId }, data: { statut: "DISPONIBLE" } });
  }
  await prisma.reservation.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
