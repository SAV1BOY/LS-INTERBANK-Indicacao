"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BookOpen,
  Plus,
  Eye,
  UserPlus,
  MessageCircle,
  XCircle,
  Building2,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";

function GerenteManual() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Seus Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Na aba <strong>Leads</strong> voce visualiza apenas os leads que foram atribuidos a voce.
            Use a barra de busca para pesquisar por empresa, CNPJ ou contato.
          </p>
          <p>
            Voce pode alternar entre a visualizacao em <strong>Tabela</strong> (lista) e <strong>Kanban</strong> (colunas por status).
            No Kanban, arraste os cards entre as colunas para alterar o status.
          </p>
          <p>
            Use os <strong>Filtros avancados</strong> para refinar por urgencia, necessidade ou apenas sua carteira.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Fluxo de Status dos Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>Os leads seguem este fluxo:</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded bg-blue-100 text-blue-800 px-2 py-1">Atribuida</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-1">Em Contato</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-green-100 text-green-800 px-2 py-1">Qualificada</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-gray-100 text-gray-800 px-2 py-1">Encerrada</span>
          </div>
          <p>
            Para avancar o status, abra o lead e use o seletor <strong>"Alterar Status"</strong> no canto superior.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Registrar Interacoes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Ao abrir um lead, clique em <strong>"Nova Interacao"</strong> para registrar contatos realizados:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Ligacao</strong> - Chamadas telefonicas</li>
            <li><strong>WhatsApp</strong> - Mensagens via WhatsApp</li>
            <li><strong>Email</strong> - Emails enviados/recebidos</li>
            <li><strong>Reuniao</strong> - Reunioes presenciais ou online</li>
            <li><strong>Nota</strong> - Anotacoes internas</li>
          </ul>
          <p>
            Preencha o <strong>Resultado</strong> da interacao (Sem Resposta, Caixa Postal, Ocupado, Contato Realizado ou Contato com Sucesso),
            as <strong>Anotacoes</strong> e o <strong>Proximo Passo</strong> com data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Qualificacao do Lead (CRM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Dentro do lead, na secao <strong>"Qualificacao"</strong>, voce pode editar rapidamente:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Urgencia</strong> - Baixa, Media, Alta ou Imediata</li>
            <li><strong>Necessidade Identificada</strong> - Tipo de produto/servico que o cliente precisa</li>
            <li><strong>Origem</strong> - Como o lead chegou</li>
          </ul>
          <p>Clique em <strong>"Salvar edicao do lead"</strong> para confirmar.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Encerrar Lead
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Ao clicar em <strong>"Encerrar"</strong>, voce escolhe o motivo:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><span className="text-green-700 font-medium">Ganho</span> - Venda Realizada (lead encerrado definitivamente)</li>
            <li><span className="text-red-700 font-medium">Perda</span> - Sem interesse, fora do perfil, concorrente, etc. (encerrado definitivamente)</li>
            <li><span className="text-orange-700 font-medium">Inativo</span> - Timing inadequado, dados incorretos, etc. (pode ser reativado no futuro)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresas (Prospeccao Propria)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Na aba <strong>Empresas</strong>, voce pode cadastrar empresas PJ que voce mesmo prospectou.
            Esses cadastros sao para seu controle pessoal e <strong>nao aparecem no Dashboard</strong>.
          </p>
          <p>
            Clique em <strong>"Nova Empresa"</strong>, preencha CNPJ, dados da empresa e contato.
            Apenas voce e o Administrador podem visualizar essas empresas.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatorios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Na aba <strong>Relatorios</strong>, voce ve metricas dos seus leads:
            total, taxa de qualificacao, encerrados e inativos.
          </p>
          <p>
            Use os botoes <strong>"Exportar Excel"</strong> ou <strong>"Exportar CSV"</strong> para baixar seus dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AliadoManual() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Cadastrar Nova Indicacao
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Clique em <strong>"Nova Indicacao"</strong> no menu lateral ou no Dashboard para cadastrar uma empresa.
          </p>
          <p>Preencha os campos obrigatorios:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>CNPJ</strong> - O sistema verifica se ja existe cadastro</li>
            <li><strong>Razao Social</strong> - Nome da empresa</li>
            <li><strong>Nome do Contato</strong> - Pessoa de referencia</li>
            <li><strong>Telefone</strong> - Para contato comercial</li>
          </ul>
          <p>Campos opcionais: Email, Cargo, Urgencia, Origem, Observacoes e <strong>Imagem anexa</strong> (PNG ou JPG ate 5MB).</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Acompanhar Suas Indicacoes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Na aba <strong>Leads</strong>, voce ve apenas as indicacoes que voce cadastrou.
            Acompanhe o status de cada uma:
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded bg-yellow-100 text-yellow-800 px-2 py-1">Pendente</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-blue-100 text-blue-800 px-2 py-1">Atribuida</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-1">Em Contato</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-green-100 text-green-800 px-2 py-1">Qualificada</span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="rounded bg-gray-100 text-gray-800 px-2 py-1">Encerrada</span>
          </div>
          <p>
            Clique em <strong>"Ver"</strong> para abrir os detalhes de qualquer indicacao.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Atribuir Lead a um Gerente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Quando um lead esta com status <strong>"Pendente"</strong>, voce pode atribui-lo a um Gerente.
          </p>
          <p>
            Abra o lead e clique no botao <strong>"Atribuir"</strong>. Selecione o Gerente responsavel
            na lista e adicione uma observacao opcional. O lead passara automaticamente para status "Atribuida".
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Adicionar Observacoes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Voce pode adicionar ou editar observacoes nas suas indicacoes a qualquer momento.
          </p>
          <p>
            Abra o lead, na secao <strong>"Qualificacao"</strong>, clique em <strong>"Adicionar"</strong> ou <strong>"Editar"</strong>
            ao lado de "Observacoes" para incluir informacoes relevantes sobre a indicacao.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            O <strong>Dashboard</strong> mostra um resumo das suas indicacoes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Indicacoes Criadas</strong> - Total deste mes</li>
            <li><strong>Taxa de Conversao</strong> - Percentual de qualificados</li>
            <li><strong>Inativos</strong> - Leads para reativar futuramente</li>
            <li><strong>Funil de Leads</strong> - Distribuicao por status (apenas seus leads)</li>
            <li><strong>Indicacoes Recentes</strong> - Ultimas indicacoes com link rapido</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManualPage() {
  const { data: session } = useSession() ?? {};
  const userRole = (session?.user as any)?.role ?? "ALIADO";
  const isGerente = userRole === "GERENTE";
  const isAliado = userRole === "ALIADO";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Manual do {isGerente ? "Gerente" : isAliado ? "Aliado" : "Sistema"}
        </h1>
        <p className="text-gray-600 mt-1">
          Guia de uso do sistema LS Indicacao
        </p>
      </div>

      {isGerente ? <GerenteManual /> : isAliado ? <AliadoManual /> : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual do Administrador</CardTitle>
              <CardDescription>Voce tem acesso total ao sistema. Consulte os manuais abaixo para referencia.</CardDescription>
            </CardHeader>
          </Card>
          <h2 className="text-lg font-semibold text-gray-800">Visao do Gerente</h2>
          <GerenteManual />
          <h2 className="text-lg font-semibold text-gray-800">Visao do Aliado</h2>
          <AliadoManual />
        </div>
      )}
    </div>
  );
}
