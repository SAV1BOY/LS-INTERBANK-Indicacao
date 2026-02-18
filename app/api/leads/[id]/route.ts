import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadInclude } from "@/lib/server/lead-serializer";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: leadInclude,
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  }

  return NextResponse.json(lead);
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json();

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: {
      necessity: body.necessity ?? undefined,
      urgency: body.urgency ?? undefined,
      notes: body.notes ?? undefined,
      source: body.source ?? undefined,
      closeReasonDetail: body.closeReasonDetail ?? undefined,
    },
    include: leadInclude,
  });

  if (body?.company || body?.contact) {
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
