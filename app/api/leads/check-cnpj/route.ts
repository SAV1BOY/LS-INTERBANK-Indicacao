import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ACTIVE_STATUSES } from "@/lib/server/lead-serializer";
import { requireUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

async function run(cnpjRaw: string) {
  const cnpj = String(cnpjRaw || "").replace(/\D/g, "");
  if (cnpj.length !== 14) {
    return NextResponse.json({ valid: false, exists: false, error: "CNPJ inválido" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { cnpj } });
  if (!company) return NextResponse.json({ valid: true, exists: false, company: null, activeLead: null, lead: null });

  const activeLead = await prisma.lead.findFirst({
    where: { companyId: company.id, status: { in: ACTIVE_STATUSES } },
    include: { responsavel: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const lead = activeLead
    ? { id: activeLead.id, status: activeLead.status, responsavel: activeLead.responsavel?.name ?? null }
    : null;

  return NextResponse.json({ valid: true, exists: Boolean(activeLead), company, activeLead: lead, lead });
}

export async function POST(request: Request) {
  const { error } = await requireUser();
  if (error) return error;
  const body = await request.json();
  return run(body?.cnpj ?? "");
}

export async function GET(request: NextRequest) {
  const { error } = await requireUser();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  return run(searchParams.get("cnpj") ?? "");
}
