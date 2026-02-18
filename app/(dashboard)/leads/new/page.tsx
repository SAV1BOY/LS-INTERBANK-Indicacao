"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  SEGMENTS,
  COMPANY_SIZES,
  BRAZILIAN_STATES,
} from "@/lib/constants";
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  Check,
  AlertTriangle,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import Link from "next/link";

export default function NewLeadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession() ?? {};
  const user = session?.user as { role: string } | undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [checkingCnpj, setCheckingCnpj] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cnpjStatus, setCnpjStatus] = useState<{
    valid: boolean;
    exists: boolean;
    lead?: any;
    company?: any;
  } | null>(null);

  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    city: "",
    state: "",
    segment: "",
    size: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactPosition: "",
    source: "",
    urgency: "",
    notes: "",
    consentimento: false,
  });

  // Handler para upload de imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem (PNG ou JPG)",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCnpjChange = (value: string) => {
    const masked = maskCNPJ(value);
    setFormData((prev) => ({ ...prev, cnpj: masked }));
    setCnpjStatus(null);
  };

  const checkCnpj = async () => {
    const cleanedCnpj = cleanCNPJ(formData.cnpj);
    if (cleanedCnpj.length !== 14) {
      toast({
        title: "CNPJ incompleto",
        description: "Digite o CNPJ completo",
        variant: "destructive",
      });
      return;
    }

    if (!validateCNPJ(cleanedCnpj)) {
      setCnpjStatus({ valid: false, exists: false });
      toast({
        title: "CNPJ inválido",
        description: "O CNPJ digitado não é válido",
        variant: "destructive",
      });
      return;
    }

    setCheckingCnpj(true);
    try {
      const response = await fetch("/api/leads/check-cnpj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj: cleanedCnpj }),
      });

      const data = await response.json();
      setCnpjStatus(data);

      if (data.exists) {
        toast({
          title: "Empresa já cadastrada",
          description: "Esta empresa já possui um lead ativo no sistema",
          variant: "destructive",
        });
      } else if (data.company) {
        setFormData((prev) => ({
          ...prev,
          razaoSocial: data.company?.razaoSocial ?? prev.razaoSocial,
          nomeFantasia: data.company?.nomeFantasia ?? prev.nomeFantasia,
        }));
        toast({
          title: "Empresa encontrada",
          description: "Dados da empresa preenchidos automaticamente",
        });
      } else {
        toast({
          title: "CNPJ válido",
          description: "CNPJ disponível para cadastro",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar CNPJ:", error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o CNPJ",
        variant: "destructive",
      });
    } finally {
      setCheckingCnpj(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razaoSocial || !formData.contactName || !formData.contactPhone) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!formData.consentimento) {
      toast({
        title: "Consentimento",
        description: "Confirme que o contato autorizou receber informações",
        variant: "destructive",
      });
      return;
    }

    if (cnpjStatus?.exists) {
      toast({
        title: "CNPJ duplicado",
        description: "Esta empresa já possui um lead ativo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao criar indicação");
      }

      toast({
        title: "Indicação registrada!",
        description: "A indicação foi salva com sucesso",
      });

      router.push(`/leads/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message ?? "Não foi possível salvar a indicação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Indicação</h1>
          <p className="text-gray-600">Registre uma nova indicação de empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                    maxLength={18}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkCnpj}
                    disabled={checkingCnpj}
                  >
                    {checkingCnpj ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                </div>
                {cnpjStatus && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-sm ${
                      cnpjStatus.exists
                        ? "text-red-600"
                        : cnpjStatus.valid
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {cnpjStatus.exists ? (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        Empresa já cadastrada - Status: {cnpjStatus.lead?.status}
                      </>
                    ) : cnpjStatus.valid ? (
                      <>
                        <Check className="h-4 w-4" />
                        CNPJ válido e disponível
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        CNPJ inválido
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="razaoSocial">Razão Social / Nome da Empresa *</Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      razaoSocial: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="state">UF</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, state: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="segment">Segmento</Label>
                <Select
                  value={formData.segment}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, segment: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENTS.map((seg) => (
                      <SelectItem key={seg.value} value={seg.value}>
                        {seg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size">Porte</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, size: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="contactName">Nome do Contato *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Telefone/WhatsApp *</Label>
                <Input
                  id="contactPhone"
                  placeholder="(00) 00000-0000"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPhone: maskPhone(e.target.value),
                    }))
                  }
                  maxLength={15}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="contactPosition">Cargo</Label>
                <Input
                  id="contactPosition"
                  value={formData.contactPosition}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactPosition: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Adicionais
            </CardTitle>
            <CardDescription>Opcional - adicione observações ou imagens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="urgency">Urgência</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, urgency: value }))
                  }
                >
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
                <Label htmlFor="source">Fonte da Indicação</Label>
                <Input
                  id="source"
                  placeholder="Ex: Indicação de cliente, evento..."
                  value={formData.source}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, source: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre a indicação..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Upload de Imagem */}
              <div className="sm:col-span-2">
                <Label>Imagem Anexa (opcional)</Label>
                <div className="mt-1">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <div className="relative w-48 h-36 rounded-lg overflow-hidden border">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-48 h-36 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1e3a5f] transition-colors"
                    >
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">PNG ou JPG</span>
                      <span className="text-xs text-gray-400">Até 5MB</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consentimento"
                checked={formData.consentimento}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    consentimento: !!checked,
                  }))
                }
              />
              <div>
                <Label htmlFor="consentimento" className="cursor-pointer">
                  O contato autorizou receber informações da LS Interbank *
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Ao marcar esta opção, você confirma que o contato consentiu em
                  receber comunicações comerciais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/leads">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || cnpjStatus?.exists}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Indicação"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
