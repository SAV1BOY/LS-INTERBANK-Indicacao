import { requireRoles } from "@/lib/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

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
  const text = String(value ?? "").split('"').join('""');
  return `"${text}"`;
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireRoles(["ADMIN", "GERENTE"]);
  if (error || !user) return error;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const format = searchParams.get("format") ?? "csv";

  const roleScope = user.role === "ADMIN" ? {} : { OR: [{ responsavelId: user.id }, { isProspeccao: true, registradorId: user.id }] };

  const leads = await prisma.lead.findMany({
    where: {
      ...roleScope,
      ...(status && status !== "all" ? { status: status as any } : {}),
    },
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

  const dateStr = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=relatorio-leads-${dateStr}.xlsx`,
      },
    });
  }

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=relatorio-leads-${dateStr}.csv`,
    },
  });
}
