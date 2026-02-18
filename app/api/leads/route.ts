import { NextRequest, NextResponse } from "next/server";
import { LeadStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";
import { requireRoles, requireUser } from "@/lib/server/auth";
import { validateLeadCreatePayload } from "@/lib/server/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error } = await requireUser();
  if (error || !user) return error;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const search = (searchParams.get("search") ?? "").trim();
  const status = searchParams.get("status");
  const prospeccao = searchParams.get("prospeccao") === "true";

  const roleScope: Prisma.LeadWhereInput =
    user.role === "ADMIN"
      ? {}
      : user.role === "GERENTE"
      ? {
          OR: [
            { responsavelId: user.id },
            { isProspeccao: true, registradorId: user.id },
          ],
        }
      : { registradorId: user.id };

  const where: Prisma.LeadWhereInput = {
    ...roleScope,
    ...(prospeccao ? { isProspeccao: true } : {}),
    ...(status && status !== "all" ? { status: status as LeadStatus } : {}),
    ...(search
      ? {
          OR: [
            { company: { razaoSocial: { contains: search, mode: "insensitive" } } },
            { company: { cnpj: { contains: search } } },
            { contact: { name: { contains: search, mode: "insensitive" } } },
            { contact: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { createdAt: "desc" },
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data: leads, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const body = await request.json();

  const isProspeccao = Boolean(body?.isProspeccao);
  const allowed: UserRole[] = isProspeccao ? ["ADMIN", "GERENTE"] : ["ADMIN", "ALIADO"];
  const { user, error } = await requireRoles(allowed);
  if (error || !user) return error;

  const validationError = validateLeadCreatePayload(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const cnpj = String(body.cnpj).replace(/\D/g, "");
  const existingCompany = await prisma.company.findUnique({ where: { cnpj } });

  const company = existingCompany
    ? await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          razaoSocial: body.razaoSocial,
          nomeFantasia: body.nomeFantasia || null,
          city: body.city || null,
          state: body.state || null,
          segment: body.segment || null,
          size: body.size || null,
          consentimento: Boolean(body.consentimento),
        },
      })
    : await prisma.company.create({
        data: {
          cnpj,
          razaoSocial: body.razaoSocial,
          nomeFantasia: body.nomeFantasia || null,
          city: body.city || null,
          state: body.state || null,
          segment: body.segment || null,
          size: body.size || null,
          consentimento: Boolean(body.consentimento),
        },
      });

  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      name: body.contactName,
      email: body.contactEmail || null,
      phone: body.contactPhone?.replace(/\D/g, "") || null,
      whatsapp: body.contactPhone?.replace(/\D/g, "") || null,
      position: body.contactPosition || null,
      consentimento: Boolean(body.consentimento),
      isPrimary: true,
    },
  });

  const registradorId = user.id;
  const responsavelId = body.responsavelId || (isProspeccao && user.role === "GERENTE" ? user.id : null);

  const lead = await prisma.lead.create({
    data: {
      companyId: company.id,
      contactId: contact.id,
      registradorId,
      responsavelId,
      status: responsavelId ? "ATRIBUIDA" : "PENDENTE",
      source: body.source || null,
      necessity: body.necessity || null,
      urgency: body.urgency || null,
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
      isProspeccao,
      assignedAt: responsavelId ? new Date() : null,
    },
    include: leadInclude,
  });

  await prisma.statusHistory.create({
    data: {
      leadId: lead.id,
      previousStatus: null,
      newStatus: lead.status,
      changedById: registradorId,
      reason: "Lead criado",
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
