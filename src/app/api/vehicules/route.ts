import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vehicules = await prisma.vehicule.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(vehicules);
}

export async function POST(req: Request) {
  const body = await req.json();
  const vehicule = await prisma.vehicule.create({ data: body });
  return NextResponse.json(vehicule, { status: 201 });
}
