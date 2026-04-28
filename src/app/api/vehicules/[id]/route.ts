import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicule = await prisma.vehicule.findUnique({ where: { id } });
  if (!vehicule) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(vehicule);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const vehicule = await prisma.vehicule.update({ where: { id }, data: body });
  return NextResponse.json(vehicule);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.vehicule.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
