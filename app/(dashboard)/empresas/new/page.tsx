"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { maskCNPJ, validateCNPJ, cleanCNPJ } from "@/lib/utils/cnpj";
import { maskPhone } from "@/lib/utils/phone";
import { SEGMENTS, COMPANY_SIZES, BRAZILIAN_STATES, NECESSITIES } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions";
import { ArrowLeft, Building2, User, Phone, Mail, Loader2, Check, AlertCircle } from "lucide-react";

export default function NovaEmpresaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession() ?? {};
  const user = session?.user as { id: string; role: string } | undefined;

  // Form state
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [segment, setSegment] = useState("");
  const [size, setSize] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactPosition, setContactPosition] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [source, setSource] = useState("Prospecção");
  const [necessity, setNecessity] = useState("");
  const [urgency, setUrgency] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "exists">("idle");

  // Verificar permissão
  if (user && !hasPermission(user.role, "prospeccao:create")) {
    router.push("/dashboard");
    return null;
  }

  const handleCnpjChange = (value: string) => {
    const masked = maskCNPJ(value);
    setCnpj(masked);
    setCnpjStatus("idle");
  };

  const checkCnpj = async () => {
    const cleanedCnpj = cleanCNPJ(cnpj);
    if (cleanedCnpj.length !== 14) {
      setCnpjStatus("invalid");
      return;
    }

    if (!validateCNPJ(cleanedCnpj)) {
      setCnpjStatus("invalid");
      return;
    }

    setCnpjStatus("checking");
    try {
      const response = await fetch(`/api/leads/check-cnpj?cnpj=${cleanedCnpj}`);
      const data = await response.json();

      if (data.exists && data.activeLead) {
        setCnpjStatus("exists");
        toast({
          title: "Empresa já possui lead ativo",
          description: `Atribuído para: ${data.activeLead.responsavel ?? "Pendente"}`,
          variant: "destructive",
        });
      } else {
        setCnpjStatus("valid");
      }
    } catch (error) {
      setCnpjStatus("valid");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cnpjStatus !== "valid") {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, verifique o CNPJ informado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cnpj: cleanCNPJ(cnpj),
          razaoSocial,
          nomeFantasia,
          city,
          state,
          segment,
          size,
          contactName,
          contactEmail,
          contactPhone,
          contactPosition,
          consentimento,
          source,
          necessity,
          urgency,
          notes,
          isProspeccao: true, // Marcar como prospecção
        }),
      });

      if (response.ok) {
        const lead = await response.json();
        toast({
          title: "Prospecção criada com sucesso!",
          description: "A empresa foi adicionada à sua carteira.",
        });
        router.push(`/leads/${lead.id}`);
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao criar prospecção",
          description: error.error ?? "Tente novamente",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao criar prospecção",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Prospecção</h1>
          <p className="text-gray-600">Cadastre uma nova empresa para sua carteira</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>Informações básicas da empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                    {cnpjStatus === "valid" && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                    {(cnpjStatus === "invalid" || cnpjStatus === "exists") && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkCnpj}
                    disabled={cnpjStatus === "checking" || cnpj.length < 18}
                  >
                    {cnpjStatus === "checking" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                </div>
                {cnpjStatus === "invalid" && (
                  <p className="text-sm text-red-500 mt-1">CNPJ inválido</p>
                )}
                {cnpjStatus === "exists" && (
                  <p className="text-sm text-red-500 mt-1">Esta empresa já possui um lead ativo</p>
                )}
              </div>

              <div>
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Nome da empresa"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Nome fantasia"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="segment">Segmento</Label>
                  <Select value={segment} onValueChange={setSegment}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">Porte</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Contato
              </CardTitle>
              <CardDescription>Informações do contato principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactName">Nome *</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nome do contato"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPosition">Cargo</Label>
                <Input
                  id="contactPosition"
                  value={contactPosition}
                  onChange={(e) => setContactPosition(e.target.value)}
                  placeholder="Ex: Diretor Financeiro"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Telefone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@empresa.com.br"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consentimento"
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="consentimento" className="text-sm font-normal">
                  Contato autorizou receber comunicações
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
              <CardDescription>Detalhes opcionais sobre a oportunidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Necessidade</Label>
                  <Select value={necessity} onValueChange={setNecessity}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {NECESSITIES.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Urgência</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="IMEDIATA">Imediata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fonte</Label>
                  <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Como conheceu a empresa"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais sobre a oportunidade..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/dashboard">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || cnpjStatus !== "valid" || !razaoSocial || !contactName || !contactPhone}
            className="bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar Prospecção"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
