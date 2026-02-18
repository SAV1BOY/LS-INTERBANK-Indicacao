import { NextRequest, NextResponse } from "next/server";
import { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");
  const search = (searchParams.get("search") ?? "").trim();
  const status = searchParams.get("status");
  const prospeccao = searchParams.get("prospeccao") === "true";

  const where: Prisma.LeadWhereInput = {
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

  return NextResponse.json({
    data: leads,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const required = ["cnpj", "razaoSocial", "contactName", "contactPhone"];
  const missing = required.filter((k) => !body?.[k]);
  if (missing.length) {
    return NextResponse.json({ error: `Campos obrigatórios ausentes: ${missing.join(", ")}` }, { status: 400 });
  }

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

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const registradorId = body.registradorId || admin?.id;

  if (!registradorId) {
    return NextResponse.json({ error: "Nenhum usuário disponível para registrar lead" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      companyId: company.id,
      contactId: contact.id,
      registradorId,
      responsavelId: body.responsavelId || null,
      status: body.responsavelId ? "ATRIBUIDA" : "PENDENTE",
      source: body.source || null,
      necessity: body.necessity || null,
      urgency: body.urgency || null,
      notes: body.notes || null,
      imageUrl: body.imageUrl || null,
      isProspeccao: Boolean(body.isProspeccao),
      assignedAt: body.responsavelId ? new Date() : null,
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
