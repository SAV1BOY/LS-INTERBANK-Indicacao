import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";
import { requireUser } from "@/lib/server/auth";
import { canAccessLead } from "@/lib/permissions";
import { validateLeadUpdatePayload } from "@/lib/server/validators";

type Params = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error;

  const lead = await prisma.lead.findUnique({ where: { id: params.id }, include: leadInclude });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  if (!canAccessLead(user.role, user.id, lead)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json(lead);
}

export async function PUT(request: Request, { params }: Params) {
  const { user, error } = await requireUser();
  if (error || !user) return error;

  const existing = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  const body = await request.json();
  const validationError = validateLeadUpdatePayload(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const isOwner = existing.registradorId === user.id;
  const isManager = user.role === "ADMIN" || user.role === "GERENTE";

  if (!isOwner && !isManager) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const data: any = {};
  if (isManager) {
    data.necessity = body.necessity ?? undefined;
    data.urgency = body.urgency ?? undefined;
    data.source = body.source ?? undefined;
    data.closeReasonDetail = body.closeReasonDetail ?? undefined;
  }
  if (isOwner || isManager) {
    data.notes = body.notes ?? undefined;
  }

  const lead = await prisma.lead.update({ where: { id: params.id }, data, include: leadInclude });

  if ((body?.company || body?.contact) && isManager) {
    if (body.company) {
      await prisma.company.update({
        where: { id: lead.companyId },
        data: {
          razaoSocial: body.company.razaoSocial ?? undefined,
          nomeFantasia: body.company.nomeFantasia ?? undefined,
          city: body.company.city ?? undefined,
          state: body.company.state ?? undefined,
          segment: body.company.segment ?? undefined,
          size: body.company.size ?? undefined,
          website: body.company.website ?? undefined,
        },
      });
    }

    if (body.contact && lead.contactId) {
      await prisma.contact.update({
        where: { id: lead.contactId },
        data: {
          name: body.contact.name ?? undefined,
          email: body.contact.email ?? undefined,
          phone: body.contact.phone ? String(body.contact.phone).replace(/\D/g, "") : undefined,
          whatsapp: body.contact.whatsapp ? String(body.contact.whatsapp).replace(/\D/g, "") : undefined,
          position: body.contact.position ?? undefined,
        },
      });
    }

    const refreshed = await prisma.lead.findUnique({ where: { id: params.id }, include: leadInclude });
    return NextResponse.json(refreshed);
  }

  return NextResponse.json(lead);
}
