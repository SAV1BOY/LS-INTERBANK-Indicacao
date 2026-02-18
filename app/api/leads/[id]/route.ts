import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";
import { requireUser } from "@/lib/server/auth";
import { canAccessLead } from "@/lib/permissions";
import { validateLeadUpdatePayload } from "@/lib/server/validators";

type Params = { params: { id: string } };

export const dynamic = "force-dynamic";

function normalize(v: unknown) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "string") return v.trim() || null;
  return v;
}

function toAuditLines(changes: Array<{ field: string; from: unknown; to: unknown }>) {
  if (!changes.length) return "";
  return changes.map((c) => `• ${c.field}: "${String(c.from ?? "-")}" -> "${String(c.to ?? "-")}"`).join("\n");
}

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

  const existing = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { company: true, contact: true },
  });
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

  const leadChanges: Array<{ field: string; from: unknown; to: unknown }> = [];
  const collectLeadChange = (field: string, next: unknown, current: unknown) => {
    if (next === undefined) return;
    if (normalize(next) !== normalize(current)) {
      leadChanges.push({ field, from: current, to: next });
    }
  };

  collectLeadChange("necessity", data.necessity, existing.necessity);
  collectLeadChange("urgency", data.urgency, existing.urgency);
  collectLeadChange("source", data.source, existing.source);
  collectLeadChange("notes", data.notes, existing.notes);

  const lead = await prisma.lead.update({ where: { id: params.id }, data, include: leadInclude });

  const companyChanges: Array<{ field: string; from: unknown; to: unknown }> = [];
  const contactChanges: Array<{ field: string; from: unknown; to: unknown }> = [];

  if ((body?.company || body?.contact) && isManager) {
    if (body.company) {
      const companyData: any = {
        razaoSocial: body.company.razaoSocial ?? undefined,
        nomeFantasia: body.company.nomeFantasia ?? undefined,
        city: body.company.city ?? undefined,
        state: body.company.state ?? undefined,
        segment: body.company.segment ?? undefined,
        size: body.company.size ?? undefined,
        website: body.company.website ?? undefined,
      };

      Object.entries(companyData).forEach(([k, v]) => {
        if (v !== undefined && normalize(v) !== normalize((existing.company as any)?.[k])) {
          companyChanges.push({ field: `company.${k}`, from: (existing.company as any)?.[k], to: v });
        }
      });

      await prisma.company.update({ where: { id: lead.companyId }, data: companyData });
    }

    if (body.contact && lead.contactId) {
      const contactData: any = {
        name: body.contact.name ?? undefined,
        email: body.contact.email ?? undefined,
        phone: body.contact.phone ? String(body.contact.phone).replace(/\D/g, "") : undefined,
        whatsapp: body.contact.whatsapp ? String(body.contact.whatsapp).replace(/\D/g, "") : undefined,
        position: body.contact.position ?? undefined,
      };

      Object.entries(contactData).forEach(([k, v]) => {
        if (v !== undefined && normalize(v) !== normalize((existing.contact as any)?.[k])) {
          contactChanges.push({ field: `contact.${k}`, from: (existing.contact as any)?.[k], to: v });
        }
      });

      await prisma.contact.update({ where: { id: lead.contactId }, data: contactData });
    }
  }

  const allChanges = [...leadChanges, ...companyChanges, ...contactChanges];

  if (allChanges.length > 0) {
    await prisma.interaction.create({
      data: {
        leadId: params.id,
        authorId: user.id,
        type: "NOTA",
        notes: `[AUDIT] Alterações de campos\n${toAuditLines(allChanges)}`,
      },
    });
  }

  const refreshed = await prisma.lead.findUnique({ where: { id: params.id }, include: leadInclude });
  return NextResponse.json(refreshed);
}
