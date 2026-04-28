import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  // Mettre le véhicule en entretien si demandé
  const entretien = await prisma.entretien.create({ data: body });

  return NextResponse.json(entretien, { status: 201 });
}
