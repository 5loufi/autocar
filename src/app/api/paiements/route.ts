import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const paiement = await prisma.paiement.create({ data: body });
  return NextResponse.json(paiement, { status: 201 });
}
