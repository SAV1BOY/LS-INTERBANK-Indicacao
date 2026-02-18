import { requireRoles } from "@/lib/server/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requireRoles(["ADMIN"]);
  if (error) return error;
  const managers = await prisma.user.findMany({
    where: { role: "GERENTE", active: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      leadsResponsible: {
        select: {
          id: true,
          status: true,
          firstContactAt: true,
          createdAt: true,
        },
      },
    },
  });

  const data = managers.map((m) => {
    const leadsAssigned = m.leadsResponsible.length;
    const leadsQualified = m.leadsResponsible.filter((l) => l.status === "QUALIFICADA").length;
    const totalActiveLeads = m.leadsResponsible.filter((l) => !["ENCERRADA", "INATIVO"].includes(l.status)).length;
    const conversionRate = leadsAssigned > 0 ? (leadsQualified / leadsAssigned) * 100 : 0;

    const avgTimeToContact = (() => {
      const contacted = m.leadsResponsible.filter((l) => l.firstContactAt);
      if (!contacted.length) return 0;
      const totalHours = contacted.reduce((acc, lead) => {
        const diffMs = new Date(lead.firstContactAt as Date).getTime() - new Date(lead.createdAt).getTime();
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      return Number((totalHours / contacted.length).toFixed(1));
    })();

    return {
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      leadsAssigned,
      leadsQualified,
      conversionRate,
      avgTimeToContact,
      totalActiveLeads,
    };
  });

  return NextResponse.json(data);
}
