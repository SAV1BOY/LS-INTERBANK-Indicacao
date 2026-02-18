"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { UrgencyBadge } from "@/components/leads/urgency-badge";
import { useToast } from "@/hooks/use-toast";
import { hasPermission } from "@/lib/permissions";
import { formatCNPJ } from "@/lib/utils/cnpj";
import { formatPhone } from "@/lib/utils/phone";
import { STATUS_LABELS, CLOSE_REASON_LABELS, WIN_REASONS, LOSS_REASONS, INACTIVE_REASONS, getAvailableTransitions, getStatusFromCloseReason } from "@/lib/utils/status";
import { INTERACTION_TYPES, INTERACTION_RESULTS, NECESSITIES } from "@/lib/constants";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  Plus,
  Loader2,
  UserPlus,
  XCircle,
  FileText,
  Users,
} from "lucide-react";
import { LeadStatus, InteractionType } from "@prisma/client";

const INTERACTION_ICONS: Record<string, any> = {
  LIGACAO: Phone,
  WHATSAPP: MessageCircle,
  EMAIL: Mail,
  REUNIAO: Users,
  NOTA: FileText,
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession() ?? {};
  const user = session?.user as { id: string; role: string } | undefined;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  // Dialogs
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const [interactionForm, setInteractionForm] = useState({
    type: "" as InteractionType | "",
    result: "",
    notes: "",
    nextStep: "",
    nextStepDate: "",
    durationMinutes: "",
  });
  const [interactionLoading, setInteractionLoading] = useState(false);

  const [closeReason, setCloseReason] = useState("");
  const [closeReasonDetail, setCloseReasonDetail] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  // Estado para edição de observações (ALIADO pode adicionar)
  const [editNotes, setEditNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  const leadId = params?.id as string;

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        if (response.ok) {
          const data = await response.json();
          setLead(data);
        } else {
          toast({
            title: "Erro",
            description: "Lead não encontrado",
            variant: "destructive",
          });
          router.push("/leads");
        }
      } catch (error) {
        console.error("Erro ao buscar lead:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users?assignable=true");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    if (leadId) {
      fetchLead();
      fetchUsers();
    }
  }, [leadId, router, toast]);

  const handleAssign = async () => {
    if (!selectedUserId) return;

    setAssignLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsavelId: selectedUserId,
          notes: assignNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setAssignDialogOpen(false);
        setSelectedUserId("");
        setAssignNotes("");
        toast({
          title: "Lead atribuído",
          description: "O responsável foi atribuído com sucesso",
        });
      } else {
        throw new Error("Erro ao atribuir lead");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o lead",
        variant: "destructive",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleInteraction = async () => {
    if (!interactionForm.type) return;

    setInteractionLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: interactionForm.type,
          result: interactionForm.result || undefined,
          notes: interactionForm.notes || undefined,
          nextStep: interactionForm.nextStep || undefined,
          nextStepDate: interactionForm.nextStepDate || undefined,
          durationMinutes: interactionForm.durationMinutes
            ? parseInt(interactionForm.durationMinutes)
            : undefined,
        }),
      });

      if (response.ok) {
        // Recarregar lead
        const leadResponse = await fetch(`/api/leads/${leadId}`);
        if (leadResponse.ok) {
          const data = await leadResponse.json();
          setLead(data);
        }
        setInteractionDialogOpen(false);
        setInteractionForm({
          type: "",
          result: "",
          notes: "",
          nextStep: "",
          nextStepDate: "",
          durationMinutes: "",
        });
        toast({
          title: "Interação registrada",
          description: "A interação foi salva com sucesso",
        });
      } else {
        throw new Error("Erro ao registrar interação");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a interação",
        variant: "destructive",
      });
    } finally {
      setInteractionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!closeReason) return;

    setCloseLoading(true);
    try {
      const finalStatus = getStatusFromCloseReason(closeReason);
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          closeReason,
          closeReasonDetail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setCloseDialogOpen(false);
        setCloseReason("");
        setCloseReasonDetail("");
        toast({
          title: finalStatus === "INATIVO" ? "Lead marcado como inativo" : "Lead encerrado",
          description: finalStatus === "INATIVO" 
            ? "O lead foi marcado como inativo e pode ser reativado no futuro" 
            : "O lead foi encerrado com sucesso",
        });
      } else {
        throw new Error("Erro ao encerrar lead");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível encerrar o lead",
        variant: "destructive",
      });
    } finally {
      setCloseLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PENDENTE" }),
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        toast({
          title: "Lead reativado",
          description: "O lead foi reativado e está pendente de atribuição",
        });
      } else {
        throw new Error("Erro ao reativar lead");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reativar o lead",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        toast({
          title: "Status atualizado",
          description: `Status alterado para ${STATUS_LABELS[newStatus]}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive",
      });
    }
  };

  // Função para ALIADO adicionar observações
  const handleSaveNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });

      if (response.ok) {
        const data = await response.json();
        setLead(data);
        setNotesDialogOpen(false);
        toast({
          title: "Observações salvas",
          description: "As observações foram atualizadas com sucesso",
        });
      } else {
        throw new Error("Erro ao salvar observações");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as observações",
        variant: "destructive",
      });
    } finally {
      setNotesLoading(false);
    }
  };

  const openNotesDialog = () => {
    setEditNotes(lead?.notes ?? "");
    setNotesDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  const canAssign = hasPermission(user?.role ?? "", "lead:assign");
  const canChangeStatus = hasPermission(user?.role ?? "", "lead:change_status");
  const canAddInteraction = hasPermission(user?.role ?? "", "interaction:create");
  const availableTransitions = getAvailableTransitions(lead.status);
  
  // ALIADO pode adicionar observações em leads que ele criou
  // Admin e Gerente também podem editar observações
  const canEditNotes = user?.id === lead.registradorId || user?.role === "ADMIN" || user?.role === "GERENTE";

  // Build timeline
  const timeline = [
    ...((lead.interactions ?? []).map((i: any) => ({
      type: "interaction",
      data: i,
      date: new Date(i.occurredAt),
    })) ?? []),
    ...((lead.statusHistory ?? []).map((s: any) => ({
      type: "status",
      data: s,
      date: new Date(s.changedAt),
    })) ?? []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.company?.razaoSocial ?? "Lead"}
            </h1>
            <p className="text-gray-600">
              {formatCNPJ(lead.company?.cnpj ?? "")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canAssign && lead.status === "PENDENTE" && (
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Atribuir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atribuir Lead</DialogTitle>
                  <DialogDescription>
                    Selecione o responsável pelo lead
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Responsável</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u._count?.leadsResponsible ?? 0} leads)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Observação</Label>
                    <Textarea
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                      placeholder="Observação opcional..."
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAssign} disabled={!selectedUserId || assignLoading}>
                    {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Atribuir"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {canAddInteraction && lead.status !== "ENCERRADA" && lead.status !== "PENDENTE" && (
            <Dialog open={interactionDialogOpen} onOpenChange={setInteractionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Interação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Interação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Tipo *</Label>
                    <Select
                      value={interactionForm.type}
                      onValueChange={(v) =>
                        setInteractionForm((prev) => ({ ...prev, type: v as InteractionType }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERACTION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Resultado</Label>
                    <Select
                      value={interactionForm.result}
                      onValueChange={(v) =>
                        setInteractionForm((prev) => ({ ...prev, result: v }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERACTION_RESULTS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Anotações</Label>
                    <Textarea
                      value={interactionForm.notes}
                      onChange={(e) =>
                        setInteractionForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Detalhes da interação..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Próximo Passo</Label>
                    <Input
                      value={interactionForm.nextStep}
                      onChange={(e) =>
                        setInteractionForm((prev) => ({ ...prev, nextStep: e.target.value }))
                      }
                      placeholder="Ex: Enviar proposta"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Data do Próximo Passo</Label>
                    <Input
                      type="date"
                      value={interactionForm.nextStepDate}
                      onChange={(e) =>
                        setInteractionForm((prev) => ({ ...prev, nextStepDate: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInteractionDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleInteraction}
                    disabled={!interactionForm.type || interactionLoading}
                  >
                    {interactionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Botões de alteração de status */}
          {canChangeStatus && lead.status !== "ENCERRADA" && lead.status !== "INATIVO" && availableTransitions.length > 0 && (
            <Select
              value=""
              onValueChange={(newStatus) => {
                if (newStatus && newStatus !== "ENCERRADA" && newStatus !== "INATIVO") {
                  handleStatusChange(newStatus as LeadStatus);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alterar Status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions
                  .filter((s) => s !== "ENCERRADA" && s !== "INATIVO")
                  .map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {canChangeStatus && lead.status === "INATIVO" && (
            <Button variant="outline" className="text-green-600 hover:text-green-700" onClick={handleReactivate}>
              <Plus className="mr-2 h-4 w-4" />
              Reativar
            </Button>
          )}

          {canChangeStatus && lead.status !== "ENCERRADA" && lead.status !== "INATIVO" && (
            <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <XCircle className="mr-2 h-4 w-4" />
                  Encerrar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Encerrar Lead</DialogTitle>
                  <DialogDescription>
                    Selecione o motivo do encerramento. Leads marcados como "Inativo" podem ser reativados no futuro.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Motivo *</Label>
                    <Select value={closeReason} onValueChange={setCloseReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-sm font-semibold text-green-700 bg-green-50">✓ Ganho</div>
                        {Object.entries(WIN_REASONS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold text-red-700 bg-red-50 mt-1">✗ Perda (Definitiva)</div>
                        {Object.entries(LOSS_REASONS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold text-orange-700 bg-orange-50 mt-1">⏸ Inativo (Reciclável)</div>
                        {Object.entries(INACTIVE_REASONS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Detalhes {closeReason === "OUTRO" && "*"}</Label>
                    <Textarea
                      value={closeReasonDetail}
                      onChange={(e) => setCloseReasonDetail(e.target.value)}
                      placeholder="Detalhes do encerramento..."
                      className="mt-1"
                    />
                  </div>
                  {closeReason && (
                    <p className="text-sm text-muted-foreground">
                      {closeReason in WIN_REASONS && "Este lead será marcado como ENCERRADO (Ganho)."}
                      {closeReason in LOSS_REASONS && "Este lead será marcado como ENCERRADO (Perda definitiva)."}
                      {closeReason in INACTIVE_REASONS && "Este lead será marcado como INATIVO e poderá ser reativado no futuro."}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClose}
                    disabled={!closeReason || closeLoading}
                  >
                    {closeLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Dialog para editar observações */}
          <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Observações</DialogTitle>
                <DialogDescription>
                  Adicione ou edite observações sobre esta indicação
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Digite suas observações aqui..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={5}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNotesDialogOpen(false)}
                  disabled={notesLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveNotes}
                  disabled={notesLoading}
                >
                  {notesLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status and Score */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Status:</span>
          <LeadStatusBadge status={lead.status} />
        </div>
        {lead.urgency && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Urgência:</span>
            <UrgencyBadge urgency={lead.urgency} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Score:</span>
          <Badge variant="outline" className="font-mono">
            {lead.leadScore ?? 0}/100
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">CNPJ</dt>
                  <dd className="font-medium">{formatCNPJ(lead.company?.cnpj ?? "")}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Razão Social</dt>
                  <dd className="font-medium">{lead.company?.razaoSocial ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Cidade/UF</dt>
                  <dd className="font-medium">
                    {lead.company?.city && lead.company?.state
                      ? `${lead.company.city}/${lead.company.state}`
                      : "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Segmento</dt>
                  <dd className="font-medium">{lead.company?.segment ?? "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contato Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Nome</dt>
                  <dd className="font-medium">{lead.contact?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Cargo</dt>
                  <dd className="font-medium">{lead.contact?.position ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Telefone</dt>
                  <dd className="font-medium">
                    {lead.contact?.phone ? (
                      <a
                        href={`tel:${lead.contact.phone}`}
                        className="text-[#1e3a5f] hover:underline"
                      >
                        {formatPhone(lead.contact.phone)}
                      </a>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="font-medium">
                    {lead.contact?.email ? (
                      <a
                        href={`mailto:${lead.contact.email}`}
                        className="text-[#1e3a5f] hover:underline"
                      >
                        {lead.contact.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Qualification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Qualificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Necessidade</dt>
                  <dd className="font-medium">
                    {NECESSITIES.find((n) => n.value === lead.necessity)?.label ?? lead.necessity ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tipo</dt>
                  <dd className="font-medium">{lead.isProspeccao ? "Prospecção" : "Indicação"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Fonte</dt>
                  <dd className="font-medium">{lead.source ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Registrador</dt>
                  <dd className="font-medium">{lead.registrador?.name ?? "-"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-gray-500 flex items-center gap-2">
                    Observações
                    {canEditNotes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openNotesDialog}
                        className="h-6 px-2 text-xs"
                      >
                        {lead.notes ? "Editar" : "Adicionar"}
                      </Button>
                    )}
                  </dt>
                  <dd className="font-medium whitespace-pre-wrap">
                    {lead.notes || <span className="text-gray-400 italic">Nenhuma observação</span>}
                  </dd>
                </div>
                {lead.imageUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-gray-500 mb-2">Imagem Anexada</dt>
                    <dd>
                      <a 
                        href={lead.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={lead.imageUrl} 
                          alt="Imagem do lead" 
                          className="max-w-full h-auto rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer max-h-64 object-contain"
                        />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
              <CardDescription>
                {timeline.length} {timeline.length === 1 ? "evento" : "eventos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma atividade registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((item, index) => {
                    if (item.type === "interaction") {
                      const Icon = INTERACTION_ICONS[item.data.type] ?? FileText;
                      return (
                        <div key={`int-${item.data.id}`} className="flex gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {INTERACTION_TYPES.find((t) => t.value === item.data.type)?.label ?? item.data.type}
                              </span>
                              {item.data.result && (
                                <Badge variant="outline" className="text-xs">
                                  {INTERACTION_RESULTS.find((r) => r.value === item.data.result)?.label ?? item.data.result}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.data.author?.name} •{" "}
                              {format(item.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                            {item.data.notes && (
                              <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded p-2">
                                {item.data.notes}
                              </p>
                            )}
                            {item.data.nextStep && (
                              <p className="mt-1 text-sm text-gray-600">
                                <span className="font-medium">Próximo:</span> {item.data.nextStep}
                                {item.data.nextStepDate && (
                                  <> ({format(new Date(item.data.nextStepDate), "dd/MM", { locale: ptBR })})</>   
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={`status-${item.data.id}`} className="flex gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Status alterado para{" "}
                              <LeadStatusBadge status={item.data.newStatus} />
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.data.changedBy?.name} •{" "}
                              {format(item.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                            {item.data.reason && (
                              <p className="mt-1 text-sm text-gray-700">
                                {item.data.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Criado em</dt>
                  <dd className="font-medium">
                    {lead.createdAt
                      ? format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "-"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Responsável</dt>
                  <dd className="font-medium">{lead.responsavel?.name ?? "Sem responsável"}</dd>
                </div>
                {lead.assignedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Atribuído em</dt>
                    <dd className="font-medium">
                      {format(new Date(lead.assignedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </dd>
                  </div>
                )}
                {lead.firstContactAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">1º Contato</dt>
                    <dd className="font-medium">
                      {format(new Date(lead.firstContactAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
