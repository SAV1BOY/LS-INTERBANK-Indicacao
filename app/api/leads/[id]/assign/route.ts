import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";
import { requireRoles } from "@/lib/server/auth";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const { user, error } = await requireRoles(["ADMIN", "ALIADO"]);
  if (error || !user) return error;

  const body = await request.json();
  if (!body?.responsavelId) {
    return NextResponse.json({ error: "responsavelId é obrigatório" }, { status: 400 });
  }

  const current = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  if (user.role === "ALIADO" && current.registradorId !== user.id) {
    return NextResponse.json({ error: "Aliado só pode atribuir os próprios leads" }, { status: 403 });
  }

  await prisma.lead.update({
    where: { id: params.id },
    data: {
      responsavelId: body.responsavelId,
      status: current.status === "PENDENTE" ? "ATRIBUIDA" : current.status,
      assignedAt: new Date(),
    },
  });

  await prisma.assignment.create({
    data: {
      leadId: params.id,
      assignedToId: body.responsavelId,
      assignedById: user.id,
      notes: body?.notes || null,
    },
  });

  if (current.status === "PENDENTE") {
    await prisma.statusHistory.create({
      data: {
        leadId: params.id,
        previousStatus: current.status,
        newStatus: "ATRIBUIDA",
        reason: "Lead atribuído",
        changedById: user.id,
      },
    });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id }, include: leadInclude });
  return NextResponse.json(lead);
}
