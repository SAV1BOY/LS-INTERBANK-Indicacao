import { NextResponse } from "next/server";
import { CloseReason, LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";
import { requireRoles } from "@/lib/server/auth";
import { canTransition } from "@/lib/utils/status";
import { canAccessLead } from "@/lib/permissions";

type Params = { params: { id: string } };

const ALLOWED_CLOSE_REASONS = new Set<CloseReason>([
  "VENDA_REALIZADA",
  "SEM_INTERESSE",
  "SEM_FIT",
  "SEM_CONTATO",
  "JA_CLIENTE",
  "CONCORRENTE",
  "TIMING",
  "DUPLICADA",
  "SEM_CONSENTIMENTO",
  "DADOS_INCORRETOS",
  "NAO_ATENDE_TELEFONE",
  "OUTRO",
]);

export async function PATCH(request: Request, { params }: Params) {
  const { user, error } = await requireRoles(["ADMIN", "GERENTE"]);
  if (error || !user) return error;

  const body = await request.json();
  const newStatus = body?.status as LeadStatus;
  if (!newStatus) return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 });

  const current = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  if (!canAccessLead(user.role, user.id, current)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  if (current.status !== newStatus && !canTransition(current.status, newStatus)) {
    return NextResponse.json({ error: `Transição inválida: ${current.status} -> ${newStatus}` }, { status: 400 });
  }

  const closeReason = body?.closeReason as CloseReason | undefined;
  if (closeReason && !ALLOWED_CLOSE_REASONS.has(closeReason)) {
    return NextResponse.json({ error: "Motivo de fechamento inválido" }, { status: 400 });
  }

  await prisma.lead.update({
    where: { id: params.id },
    data: {
      status: newStatus,
      closeReason: closeReason || null,
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
      changedById: user.id,
    },
  });

  const lead = await prisma.lead.findUnique({ where: { id: params.id }, include: leadInclude });
  return NextResponse.json(lead);
}

export async function PUT(request: Request, context: Params) {
  return PATCH(request, context);
}
