import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const headers = [
  "lead_id",
  "empresa",
  "cnpj",
  "status",
  "urgencia",
  "necessidade",
  "origem",
  "registrador",
  "responsavel",
  "cidade",
  "estado",
  "created_at",
  "updated_at",
];

function csvEscape(value: unknown) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const leads = await prisma.lead.findMany({
    where: status && status !== "all" ? { status: status as any } : undefined,
    include: {
      company: true,
      registrador: { select: { name: true } },
      responsavel: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = leads.map((lead) => [
    lead.id,
    lead.company.razaoSocial,
    lead.company.cnpj,
    lead.status,
    lead.urgency ?? "",
    lead.necessity ?? "",
    lead.source ?? "",
    lead.registrador.name,
    lead.responsavel?.name ?? "",
    lead.company.city ?? "",
    lead.company.state ?? "",
    lead.createdAt.toISOString(),
    lead.updatedAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=relatorio-leads-${new Date().toISOString().slice(0, 10)}.csv`,
    },
  });
}
