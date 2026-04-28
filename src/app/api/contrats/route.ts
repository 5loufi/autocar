import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { reservationId } = await req.json();

  const existing = await prisma.contrat.findUnique({ where: { reservationId } });
  if (existing) return NextResponse.json(existing);

  const count = await prisma.contrat.count();
  const numero = `CTR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const contrat = await prisma.contrat.create({
    data: { reservationId, numero },
  });

  return NextResponse.json(contrat, { status: 201 });
}
