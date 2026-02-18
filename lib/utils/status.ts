import { LeadStatus } from "@prisma/client";

export const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  PENDENTE: ['ATRIBUIDA', 'ENCERRADA', 'INATIVO'],
  ATRIBUIDA: ['EM_CONTATO', 'ENCERRADA', 'INATIVO'],
  EM_CONTATO: ['QUALIFICADA', 'ENCERRADA', 'INATIVO'],
  QUALIFICADA: ['ENCERRADA', 'INATIVO'],
  ENCERRADA: [],
  INATIVO: ['PENDENTE'], // Pode reativar um lead inativo
};

export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(currentStatus: LeadStatus): LeadStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  PENDENTE: 'Pendente',
  ATRIBUIDA: 'Atribuída',
  EM_CONTATO: 'Em Contato',
  QUALIFICADA: 'Qualificada',
  ENCERRADA: 'Encerrada',
  INATIVO: 'Inativo',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  ATRIBUIDA: 'bg-blue-100 text-blue-800',
  EM_CONTATO: 'bg-indigo-100 text-indigo-800',
  QUALIFICADA: 'bg-green-100 text-green-800',
  ENCERRADA: 'bg-gray-100 text-gray-800',
  INATIVO: 'bg-orange-100 text-orange-800',
};

// Motivos de GANHO (venda concluída)
export const WIN_REASONS: Record<string, string> = {
  VENDA_REALIZADA: 'Venda Realizada',
};

// Motivos de PERDA (definitiva - não retorna)
export const LOSS_REASONS: Record<string, string> = {
  SEM_INTERESSE: 'Sem interesse no momento',
  SEM_FIT: 'Fora do perfil (sem fit)',
  JA_CLIENTE: 'Já é cliente LS Interbank',
  DUPLICADA: 'Lead duplicado',
  SEM_CONSENTIMENTO: 'Sem consentimento para contato',
};

// Motivos de INATIVO (reciclável para futuro - pode retornar)
export const INACTIVE_REASONS: Record<string, string> = {
  NAO_FOI_POSSIVEL_CONTATO: 'Não foi possível contato',
  OPTOU_CONCORRENTE: 'Optou por concorrente',
  TIMING_INADEQUADO: 'Timing inadequado (retornar futuro)',
  OUTRO_MOTIVO: 'Outro motivo',
};

// Todos os motivos combinados
export const CLOSE_REASON_LABELS: Record<string, string> = {
  ...WIN_REASONS,
  ...LOSS_REASONS,
  ...INACTIVE_REASONS,
};

// Função para determinar o status final baseado no motivo
export function getStatusFromCloseReason(reason: string): 'ENCERRADA' | 'INATIVO' {
  if (reason in WIN_REASONS || reason in LOSS_REASONS) {
    return 'ENCERRADA';
  }
  return 'INATIVO';
}

export const URGENCY_LABELS: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  IMEDIATA: 'Imediata',
};

export const URGENCY_COLORS: Record<string, string> = {
  BAIXA: 'bg-gray-100 text-gray-700',
  MEDIA: 'bg-yellow-100 text-yellow-700',
  ALTA: 'bg-orange-100 text-orange-700',
  IMEDIATA: 'bg-red-100 text-red-700',
};
