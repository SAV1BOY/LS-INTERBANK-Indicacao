import { requireUser } from "@/lib/server/auth";
import { NextResponse } from "next/server";
import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const STATUSES: LeadStatus[] = ["PENDENTE", "ATRIBUIDA", "EM_CONTATO", "QUALIFICADA", "ENCERRADA", "INATIVO"];

export async function GET() {
  const { user, error } = await requireUser();
  if (error || !user) return error;
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const where = user.role === "ADMIN" ? {} : user.role === "GERENTE" ? { OR: [{ responsavelId: user.id }, { isProspeccao: true, registradorId: user.id }] } : { registradorId: user.id };

  const [totalLeads, leadsCreated, pendingLeads, inativoCount, groupedStatus] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { ...where, createdAt: { gte: startMonth } } }),
    prisma.lead.count({ where: { ...where, status: "PENDENTE" } }),
    prisma.lead.count({ where: { ...where, status: "INATIVO" } }),
    prisma.lead.groupBy({ where, by: ["status"], _count: { status: true } }),
  ]);

  const statusCounts: Record<string, number> = {};
  STATUSES.forEach((s) => {
    statusCounts[s] = groupedStatus.find((g) => g.status === s)?._count.status ?? 0;
  });

  const qualifiedCount = statusCounts.QUALIFICADA ?? 0;
  const conversionRate = totalLeads > 0 ? Number(((qualifiedCount / totalLeads) * 100).toFixed(1)) : 0;

  const recentLeads = await prisma.lead.findMany({
    where,
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      responsavel: { select: { name: true } },
      registrador: { select: { name: true } },
    },
  });

  return NextResponse.json({
    totalLeads,
    leadsCreated,
    pendingLeads,
    inativoCount,
    conversionRate,
    statusCounts,
    funnel: STATUSES.map((status) => ({ status, count: statusCounts[status] ?? 0 })),
    pendingQueue: recentLeads.filter((l) => l.status === "PENDENTE"),
    recentLeads,
  });
}
