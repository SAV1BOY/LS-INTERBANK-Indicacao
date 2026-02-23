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
    if (body.necessity !== undefined) data.necessity = body.necessity;
    if (body.urgency !== undefined) data.urgency = body.urgency;
    if (body.source !== undefined) data.source = body.source;
    if (body.closeReasonDetail !== undefined) data.closeReasonDetail = body.closeReasonDetail;
  }
  if (isOwner || isManager) {
    if (body.notes !== undefined) data.notes = body.notes;
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
      const companyData: any = {};
      for (const k of ["razaoSocial", "nomeFantasia", "city", "state", "segment", "size", "website"] as const) {
        if (body.company[k] !== undefined) companyData[k] = body.company[k];
      }

      Object.entries(companyData).forEach(([k, v]) => {
        if (v !== undefined && normalize(v) !== normalize((existing.company as any)?.[k])) {
          companyChanges.push({ field: `company.${k}`, from: (existing.company as any)?.[k], to: v });
        }
      });

      await prisma.company.update({ where: { id: lead.companyId }, data: companyData });
    }

    if (body.contact && lead.contactId) {
      const contactData: any = {};
      if (body.contact.name !== undefined) contactData.name = body.contact.name;
      if (body.contact.email !== undefined) contactData.email = body.contact.email;
      if (body.contact.phone !== undefined) contactData.phone = body.contact.phone ? String(body.contact.phone).replace(/\D/g, "") : null;
      if (body.contact.whatsapp !== undefined) contactData.whatsapp = body.contact.whatsapp ? String(body.contact.whatsapp).replace(/\D/g, "") : null;
      if (body.contact.position !== undefined) contactData.position = body.contact.position;

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
