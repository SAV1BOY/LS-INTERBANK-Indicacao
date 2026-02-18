"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { hasPermission } from "@/lib/permissions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Plus,
  Building2,
  PauseCircle,
} from "lucide-react";
import Link from "next/link";
import { LeadStatus } from "@prisma/client";

interface DashboardStats {
  leadsCreated: number;
  pendingLeads: number;
  conversionRate: number;
  inativoCount: number;
  funnel: { status: LeadStatus; count: number }[];
  pendingQueue: any[];
  recentLeads: any[];
}

export default function DashboardPage() {
  const { data: session } = useSession() ?? {};
  const user = session?.user as { id: string; role: string; name: string } | undefined;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const userRole = user?.role ?? "ALIADO";
  const isAdmin = userRole === "ADMIN";
  const isGerente = userRole === "GERENTE";
  const isAliado = userRole === "ALIADO";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Funil de Leads - Gerente não vê Pendentes
  const funnelOrder: LeadStatus[] = isGerente 
    ? ["ATRIBUIDA", "EM_CONTATO", "QUALIFICADA", "ENCERRADA", "INATIVO"]
    : ["PENDENTE", "ATRIBUIDA", "EM_CONTATO", "QUALIFICADA", "ENCERRADA", "INATIVO"];
  
  const sortedFunnel = funnelOrder.map((status) => ({
    status,
    count: stats?.funnel?.find((f) => f.status === status)?.count ?? 0,
  }));

  const maxCount = Math.max(...sortedFunnel.map((f) => f.count), 1);

  // Título do Dashboard baseado no papel
  const getDashboardTitle = () => {
    if (isAdmin) return "Dashboard Administrativo";
    if (isGerente) return "Minha Carteira";
    return "Minhas Indicações";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getDashboardTitle()}
          </h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo, {user?.name ?? "Usuário"}!
          </p>
        </div>
        <div className="flex gap-2">
          {/* Aliado e Admin podem criar indicações */}
          {(isAliado || isAdmin) && (
            <Link href="/leads/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Indicação
              </Button>
            </Link>
          )}
          {/* Gerente pode criar prospecção própria */}
          {(isGerente || isAdmin) && (
            <Link href="/empresas/new">
              <Button variant={isGerente ? "default" : "outline"}>
                <Building2 className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isAliado ? "Indicações Criadas" : "Leads Ativos"}
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-[#1e3a5f]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "-" : stats?.leadsCreated ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </CardContent>
        </Card>

        {/* Admin vê pendentes, Gerente e Aliado não */}
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pendentes
              </CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? "-" : stats?.pendingLeads ?? 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Aguardando atribuição</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "-" : `${stats?.conversionRate ?? 0}%`}
            </div>
            <p className="text-xs text-gray-500 mt-1">Qualificados / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inativos
            </CardTitle>
            <PauseCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "-" : stats?.inativoCount ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Para reativar futuramente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Leads</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedFunnel.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <LeadStatusBadge status={item.status} />
                    <span className="font-semibold text-gray-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[#1e3a5f] transition-all duration-500"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leads Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {isAliado ? "Minhas Indicações Recentes" : "Leads Recentes"}
            </CardTitle>
            <CardDescription>Últimas atualizações</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-4">Carregando...</p>
            ) : (stats?.recentLeads?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum lead encontrado
              </p>
            ) : (
              <div className="space-y-3">
                {stats?.recentLeads?.slice(0, 5).map((lead: any) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {lead.company?.razaoSocial ?? "Empresa"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <LeadStatusBadge status={lead.status} />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Link>
                )) ?? null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Queue - only for Admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fila Pendente</CardTitle>
                <CardDescription>
                  Leads aguardando atribuição de gerente
                </CardDescription>
              </div>
              <Link href="/leads?status=PENDENTE">
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-4">Carregando...</p>
            ) : (stats?.pendingQueue?.length ?? 0) === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum lead pendente
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Empresa
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Contato
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Tempo
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.pendingQueue?.map((lead: any) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium">
                            {lead.company?.razaoSocial ?? ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {lead.company?.cnpj ?? ""}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p>{lead.contact?.name ?? ""}</p>
                          <p className="text-sm text-gray-500">
                            {lead.contact?.phone ?? ""}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.createdAt
                            ? formatDistanceToNow(new Date(lead.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/leads/${lead.id}`}>
                            <Button size="sm">Atribuir</Button>
                          </Link>
                        </td>
                      </tr>
                    )) ?? null}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
