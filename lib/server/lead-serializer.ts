import { LeadStatus, Prisma } from "@prisma/client";

export const leadInclude = {
  company: true,
  contact: true,
  registrador: { select: { id: true, name: true, email: true, role: true } },
  responsavel: { select: { id: true, name: true, email: true, role: true } },
  interactions: {
    orderBy: { createdAt: "desc" as const },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  statusHistory: {
    orderBy: { changedAt: "desc" as const },
    include: {
      changedBy: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  assignments: {
    orderBy: { assignedAt: "desc" as const },
    include: {
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      assignedBy: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  _count: {
    select: {
      interactions: true,
    },
  },
} satisfies Prisma.LeadInclude;

export const ACTIVE_STATUSES: LeadStatus[] = ["PENDENTE", "ATRIBUIDA", "EM_CONTATO", "QUALIFICADA"];
