import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ACTIVE_STATUSES } from "@/lib/server/lead-serializer";

export const dynamic = "force-dynamic";

async function run(cnpjRaw: string) {
  const cnpj = String(cnpjRaw || "").replace(/\D/g, "");
  if (cnpj.length !== 14) {
    return NextResponse.json({ valid: false, exists: false, error: "CNPJ inválido" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { cnpj } });

  if (!company) {
    return NextResponse.json({ valid: true, exists: false, company: null });
  }

  const activeLead = await prisma.lead.findFirst({
    where: {
      companyId: company.id,
      status: { in: ACTIVE_STATUSES },
    },
    include: {
      responsavel: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    valid: true,
    exists: Boolean(activeLead),
    company,
    activeLead: activeLead
      ? {
          id: activeLead.id,
          status: activeLead.status,
          responsavel: activeLead.responsavel?.name ?? null,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return run(body?.cnpj ?? "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return run(searchParams.get("cnpj") ?? "");
}
