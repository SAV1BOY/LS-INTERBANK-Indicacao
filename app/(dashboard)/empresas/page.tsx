"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { Building2, Plus, Search, Eye, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCNPJ } from "@/lib/utils/cnpj";
import { formatPhone } from "@/lib/utils/phone";
import { hasPermission } from "@/lib/permissions";
import { LeadStatus } from "@prisma/client";

interface Prospeccao {
  id: string;
  status: LeadStatus;
  createdAt: string;
  isProspeccao: boolean;
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
}

export default function EmpresasPage() {
  const { data: session } = useSession() ?? {};
  const userRole = (session?.user as any)?.role ?? "ALIADO";
  const userId = (session?.user as any)?.id;
  
  const [prospeccoes, setProspeccoes] = useState<Prospeccao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const canCreateProspeccao = hasPermission(userRole, "prospeccao:create");

  useEffect(() => {
    const fetchProspeccoes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("prospeccao", "true");
        if (search) {
          params.set("search", search);
        }
        
        const response = await fetch(`/api/leads?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          // Filtra apenas prospecções
          setProspeccoes((data.data ?? []).filter((l: any) => l.isProspeccao));
        }
      } catch (error) {
        console.error("Erro ao buscar prospecções:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProspeccoes();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">
            Prospecção própria - empresas cadastradas para acompanhamento individual
          </p>
        </div>
        {canCreateProspeccao && (
          <Link href="/empresas/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por empresa, CNPJ ou contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
            </div>
          ) : prospeccoes.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma empresa cadastrada</h3>
              <p className="text-gray-500 mt-2">
                {canCreateProspeccao 
                  ? "Clique em \"Nova Empresa\" para cadastrar uma empresa para sua prospecção própria."
                  : "Você não tem permissão para cadastrar empresas."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Empresa</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Contato</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Data</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {prospeccoes.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.company?.razaoSocial ?? ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCNPJ(item.company?.cnpj ?? "")}
                          </p>
                          {item.company?.city && item.company?.state && (
                            <p className="text-xs text-gray-400">
                              {item.company.city}/{item.company.state}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{item.contact?.name ?? "-"}</p>
                          <p className="text-sm text-gray-500">
                            {item.contact?.phone ? formatPhone(item.contact.phone) : "-"}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <LeadStatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">
                            {item.createdAt
                              ? format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })
                              : "-"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.createdAt
                              ? formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })
                              : ""}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/leads/${item.id}`}>
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
    </div>
  );
}
