"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { UrgencyBadge } from "@/components/leads/urgency-badge";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Plus, Eye, Loader2, LayoutGrid, Table2, Save } from "lucide-react";
import { STATUS_LABELS } from "@/lib/utils/status";
import { formatCNPJ } from "@/lib/utils/cnpj";
import { formatPhone } from "@/lib/utils/phone";
import { LeadStatus } from "@prisma/client";
import { hasPermission } from "@/lib/permissions";
import { NECESSITIES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  status: LeadStatus;
  leadScore: number;
  urgency: string | null;
  necessity?: string | null;
  createdAt: string;
  company: {
    razaoSocial: string;
    cnpj: string;
    city: string | null;
    state: string | null;
  };
  contact: {
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
  registrador: { name: string };
  responsavel: { name: string } | null;
  _count: { interactions: number };
}

const KANBAN_ORDER: LeadStatus[] = ["PENDENTE", "ATRIBUIDA", "EM_CONTATO", "QUALIFICADA", "ENCERRADA", "INATIVO"];

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession() ?? {};
  const { toast } = useToast();
  const userRole = (session?.user as any)?.role ?? "ALIADO";
  const userId = (session?.user as any)?.id;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams?.get("status") ?? "all");
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);

  const canCreateIndication = hasPermission(userRole, "lead:create");
  const canChangeStatus = hasPermission(userRole, "lead:change_status");

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "200");
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
        if (search) params.set("search", search);

        const response = await fetch(`/api/leads?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setLeads(data.data ?? []);
          setTotal(data.total ?? 0);
        }
      } catch (error) {
        console.error("Erro ao buscar leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page, statusFilter, search]);

  const byStatus = useMemo(() => {
    return KANBAN_ORDER.reduce((acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    }, {} as Record<LeadStatus, Lead[]>);
  }, [leads]);

  const updateLeadFields = async (leadId: string, data: Partial<Lead>) => {
    setSavingLeadId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...updated } : l)));
      toast({ title: "Lead atualizado", description: "Urgência/necessidade atualizadas com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar o lead.", variant: "destructive" });
    } finally {
      setSavingLeadId(null);
    }
  };

  const onDropStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!canChangeStatus) return;
    setSavingLeadId(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, changedById: userId }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status: updated.status } : lead)));
      toast({ title: "Status alterado", description: `Lead movido para ${STATUS_LABELS[newStatus]}.` });
    } catch {
      toast({ title: "Erro", description: "Não foi possível alterar o status.", variant: "destructive" });
    } finally {
      setSavingLeadId(null);
    }
  };

  const renderQuickEdit = (lead: Lead) => (
    <div className="flex flex-col gap-2 min-w-[170px]">
      <Select
        value={lead.urgency ?? "NONE"}
        onValueChange={(v) => updateLeadFields(lead.id, { urgency: v === "NONE" ? null : v })}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Urgência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">Sem urgência</SelectItem>
          <SelectItem value="BAIXA">Baixa</SelectItem>
          <SelectItem value="MEDIA">Média</SelectItem>
          <SelectItem value="ALTA">Alta</SelectItem>
          <SelectItem value="IMEDIATA">Imediata</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={lead.necessity ?? "outro"}
        onValueChange={(v) => updateLeadFields(lead.id, { necessity: v })}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Necessidade" />
        </SelectTrigger>
        <SelectContent>
          {NECESSITIES.map((n) => (
            <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">{total} {total === 1 ? "lead encontrado" : "leads encontrados"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "table" ? "default" : "outline"} onClick={() => setViewMode("table")}>
            <Table2 className="mr-2 h-4 w-4" />Tabela
          </Button>
          <Button variant={viewMode === "kanban" ? "default" : "outline"} onClick={() => setViewMode("kanban")}>
            <LayoutGrid className="mr-2 h-4 w-4" />Kanban
          </Button>
          {canCreateIndication && (
            <Link href="/leads/new"><Button><Plus className="mr-2 h-4 w-4" />Nova Indicação</Button></Link>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Buscar por empresa, CNPJ ou contato..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (<SelectItem key={value} value={value}>{label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" /></CardContent></Card>
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Nenhum lead encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Empresa</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Contato</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Responsável</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Urgência/Necessidade</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Data</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{lead.company?.razaoSocial ?? ""}</p>
                          <p className="text-sm text-gray-500">{formatCNPJ(lead.company?.cnpj ?? "")}</p>
                          {lead.company?.city && lead.company?.state && <p className="text-xs text-gray-400">{lead.company.city}/{lead.company.state}</p>}
                        </td>
                        <td className="py-4 px-4"><p>{lead.contact?.name ?? "-"}</p><p className="text-sm text-gray-500">{lead.contact?.phone ? formatPhone(lead.contact.phone) : "-"}</p></td>
                        <td className="py-4 px-4"><div className="flex flex-col gap-1"><LeadStatusBadge status={lead.status} /><UrgencyBadge urgency={lead.urgency as any} /></div></td>
                        <td className="py-4 px-4">{lead.responsavel?.name ?? "Sem responsável"}</td>
                        <td className="py-4 px-4">{renderQuickEdit(lead)}</td>
                        <td className="py-4 px-4">
                          <p>{lead.createdAt ? format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}</p>
                          <p className="text-sm text-gray-500">{lead.createdAt ? formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR }) : ""}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/leads/${lead.id}`}><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />Ver</Button></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {KANBAN_ORDER.map((status) => (
            <Card
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const leadId = e.dataTransfer.getData("text/plain");
                if (leadId) onDropStatus(leadId, status);
              }}
            >
              <CardContent className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">{STATUS_LABELS[status]}</p>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{byStatus[status]?.length ?? 0}</span>
                </div>
                <div className="space-y-2">
                  {(byStatus[status] ?? []).map((lead) => (
                    <div key={lead.id} draggable className="rounded border bg-white p-2 shadow-sm" onDragStart={(e) => e.dataTransfer.setData("text/plain", lead.id)}>
                      <p className="text-xs font-semibold text-gray-900 truncate">{lead.company.razaoSocial}</p>
                      <p className="text-[11px] text-gray-500 truncate">{lead.contact?.name ?? "Sem contato"}</p>
                      <div className="mt-2">{renderQuickEdit(lead)}</div>
                      <div className="mt-2 flex justify-end"><Link href={`/leads/${lead.id}`} className="text-xs text-blue-600">Abrir</Link></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {savingLeadId && (
        <div className="fixed bottom-4 right-4 rounded-md bg-[#1e3a5f] px-3 py-2 text-xs text-white flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Salvando alterações...
        </div>
      )}
    </div>
  );
}
