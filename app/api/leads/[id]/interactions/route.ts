import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const body = await request.json();

  if (!body?.type) {
    return NextResponse.json({ error: "Tipo é obrigatório" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  }

  const authorId = body?.authorId || lead.responsavelId || lead.registradorId;

  const interaction = await prisma.interaction.create({
    data: {
      leadId: params.id,
      authorId,
      type: body.type,
      result: body.result || null,
      notes: body.notes || null,
      nextStep: body.nextStep || null,
      nextStepDate: body.nextStepDate ? new Date(body.nextStepDate) : null,
      durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : null,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json(interaction, { status: 201 });
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json();

  if (!body?.interactionId) {
    return NextResponse.json({ error: "interactionId é obrigatório" }, { status: 400 });
  }

  const existing = await prisma.interaction.findFirst({
    where: { id: body.interactionId, leadId: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Interação não encontrada" }, { status: 404 });
  }

  const interaction = await prisma.interaction.update({
    where: { id: body.interactionId },
    data: {
      type: body.type ?? existing.type,
      result: body.result ?? existing.result,
      notes: body.notes ?? existing.notes,
      nextStep: body.nextStep ?? existing.nextStep,
      nextStepDate: body.nextStepDate ? new Date(body.nextStepDate) : existing.nextStepDate,
      durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : existing.durationMinutes,
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return NextResponse.json(interaction);
}
