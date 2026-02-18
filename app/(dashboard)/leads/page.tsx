"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Plus, Eye, Loader2 } from "lucide-react";
import { STATUS_LABELS } from "@/lib/utils/status";
import { formatCNPJ } from "@/lib/utils/cnpj";
import { formatPhone } from "@/lib/utils/phone";
import { LeadStatus } from "@prisma/client";
import { hasPermission } from "@/lib/permissions";

interface Lead {
  id: string;
  status: LeadStatus;
  leadScore: number;
  urgency: string | null;
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

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession() ?? {};
  const userRole = (session?.user as any)?.role ?? "ALIADO";
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams?.get("status") ?? "all"
  );

  // Verifica se pode criar indicação (Admin e Aliado sim, Gerente não)
  const canCreateIndication = hasPermission(userRole, "lead:create");

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "20");
        if (statusFilter && statusFilter !== "all") {
          params.set("status", statusFilter);
        }
        if (search) {
          params.set("search", search);
        }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">
            {total} {total === 1 ? "lead encontrado" : "leads encontrados"}
          </p>
        </div>
        {canCreateIndication && (
          <Link href="/leads/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Indicação
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por empresa, CNPJ ou contato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      Empresa
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      Contato
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      Responsável
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      Data
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.company?.razaoSocial ?? ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCNPJ(lead.company?.cnpj ?? "")}
                          </p>
                          {lead.company?.city && lead.company?.state && (
                            <p className="text-xs text-gray-400">
                              {lead.company.city}/{lead.company.state}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">
                            {lead.contact?.name ?? "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lead.contact?.phone
                              ? formatPhone(lead.contact.phone)
                              : "-"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <LeadStatusBadge status={lead.status} />
                          <UrgencyBadge urgency={lead.urgency as any} />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">
                          {lead.responsavel?.name ?? "Sem responsável"}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">
                            {lead.createdAt
                              ? format(new Date(lead.createdAt), "dd/MM/yyyy", {
                                  locale: ptBR,
                                })
                              : "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lead.createdAt
                              ? formatDistanceToNow(new Date(lead.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })
                              : ""}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/leads/${lead.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
