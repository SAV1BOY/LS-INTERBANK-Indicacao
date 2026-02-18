import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const body = await request.json();
  const newStatus = body?.status as LeadStatus;

  if (!newStatus) {
    return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 });
  }

  const current = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!current) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  }

  const changedById = body?.changedById || current.responsavelId || current.registradorId;

  await prisma.lead.update({
    where: { id: params.id },
    data: {
      status: newStatus,
      closeReason: body?.closeReason || null,
      closeReasonDetail: body?.closeReasonDetail || null,
      closedAt: newStatus === "ENCERRADA" || newStatus === "INATIVO" ? new Date() : null,
      qualifiedAt: newStatus === "QUALIFICADA" ? new Date() : current.qualifiedAt,
      firstContactAt: newStatus === "EM_CONTATO" && !current.firstContactAt ? new Date() : current.firstContactAt,
      assignedAt: newStatus === "ATRIBUIDA" && !current.assignedAt ? new Date() : current.assignedAt,
    },
  });

  await prisma.statusHistory.create({
    data: {
      leadId: params.id,
      previousStatus: current.status,
      newStatus,
      reason: body?.reason || body?.closeReasonDetail || null,
      changedById,
    },
  });

  const lead = await prisma.lead.findUnique({ where: { id: params.id }, include: leadInclude });
  return NextResponse.json(lead);
}

export async function PUT(request: Request, context: Params) {
  return PATCH(request, context);
}
