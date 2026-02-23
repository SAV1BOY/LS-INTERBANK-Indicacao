"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Download
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/utils/status";

interface PerformanceData {
  id: string;
  name: string;
  email: string;
  role: string;
  leadsAssigned: number;
  leadsQualified: number;
  conversionRate: number;
  avgTimeToContact: number;
  totalActiveLeads: number;
}

interface StatsData {
  totalLeads: number;
  statusCounts: Record<string, number>;
  periodComparison: {
    current: number;
    previous: number;
    change: number;
  };
}

export default function RelatoriosPage() {
  const { data: session } = useSession() ?? {};
  const userRole = (session?.user as any)?.role ?? "ALIADO";
  
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar performance dos gerentes (só Admin)
        if (isAdmin) {
          const perfRes = await fetch("/api/dashboard/performance");
          if (perfRes.ok) {
            const perfData = await perfRes.json();
            setPerformance(perfData);
          }
        }

        // Buscar estatísticas gerais
        const statsRes = await fetch("/api/dashboard/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalLeads: statsData.totalLeads ?? 0,
            statusCounts: statsData.statusCounts ?? {},
            periodComparison: statsData.periodComparison ?? { current: 0, previous: 0, change: 0 },
          });
        }
      } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);


  const handleExport = async (format: "csv" | "xlsx" = "csv") => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}`);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-leads-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar relatório", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  const totalLeads = stats?.totalLeads ?? 0;
  const statusCounts = stats?.statusCounts ?? {};
  const encerradas = statusCounts["ENCERRADA"] ?? 0;
  const qualificadas = statusCounts["QUALIFICADA"] ?? 0;
  const inativas = statusCounts["INATIVO"] ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Visualize métricas e KPIs da operação</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport("xlsx")} variant="default">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={() => handleExport("csv")} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Leads</CardDescription>
            <CardTitle className="text-3xl">{totalLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+{stats?.periodComparison?.change ?? 0}% vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Qualificação</CardDescription>
            <CardTitle className="text-3xl">
              {totalLeads > 0 ? Math.round((qualificadas / totalLeads) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Target className="h-4 w-4 mr-1" />
              <span>{qualificadas} leads qualificados</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leads Encerrados</CardDescription>
            <CardTitle className="text-3xl">{encerradas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span>Concluídos definitivamente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Leads Inativos</CardDescription>
            <CardTitle className="text-3xl">{inativas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-orange-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Aguardando reativação</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funil de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Funil de Vendas
          </CardTitle>
          <CardDescription>Distribuição dos leads por status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = statusCounts[status] ?? 0;
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-gray-600">{count} leads ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        status === "ENCERRADA" ? "bg-gray-500" :
                        status === "INATIVO" ? "bg-orange-500" :
                        status === "QUALIFICADA" ? "bg-green-500" :
                        status === "EM_CONTATO" ? "bg-indigo-500" :
                        status === "ATRIBUIDA" ? "bg-blue-500" :
                        "bg-yellow-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance dos Gerentes (apenas Admin) */}
      {isAdmin && performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance dos Gerentes
            </CardTitle>
            <CardDescription>Acompanhamento individual de cada gerente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Gerente</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Leads Atribuídos</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Qualificados</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Taxa Conversão</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Leads Ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-sm text-gray-500">{p.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline">{p.leadsAssigned}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {p.leadsQualified}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${p.conversionRate >= 50 ? 'text-green-600' : p.conversionRate >= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {p.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge>{p.totalActiveLeads}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
