import { CloseReason, InteractionResult, InteractionType, LeadStatus, Urgency, UserRole } from "@prisma/client";

const LEAD_STATUSES: LeadStatus[] = ["PENDENTE", "ATRIBUIDA", "EM_CONTATO", "QUALIFICADA", "ENCERRADA", "INATIVO"];
const URGENCIES: Urgency[] = ["BAIXA", "MEDIA", "ALTA", "IMEDIATA"];
const INTERACTION_TYPES: InteractionType[] = ["LIGACAO", "WHATSAPP", "EMAIL", "REUNIAO", "NOTA"];
const INTERACTION_RESULTS: InteractionResult[] = ["SEM_RESPOSTA", "CAIXA_POSTAL", "OCUPADO", "CONTATO_REALIZADO", "CONTATO_SUCESSO"];
const USER_ROLES: UserRole[] = ["ADMIN", "GERENTE", "ALIADO"];
const CLOSE_REASONS: CloseReason[] = [
  "VENDA_REALIZADA",
  "SEM_INTERESSE",
  "SEM_FIT",
  "SEM_CONTATO",
  "JA_CLIENTE",
  "CONCORRENTE",
  "TIMING",
  "DUPLICADA",
  "SEM_CONSENTIMENTO",
  "DADOS_INCORRETOS",
  "NAO_ATENDE_TELEFONE",
  "OUTRO",
];

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function asTrimmedString(v: unknown): string | null {
  if (!isString(v)) return null;
  const s = v.trim();
  return s.length ? s : null;
}

export function validateLeadCreatePayload(body: any): string | null {
  if (!body || typeof body !== "object") return "Payload inválido";
  if (!asTrimmedString(body.cnpj)) return "CNPJ é obrigatório";
  if (!asTrimmedString(body.razaoSocial)) return "Razão social é obrigatória";
  if (!asTrimmedString(body.contactName)) return "Contato é obrigatório";
  if (!asTrimmedString(body.contactPhone)) return "Telefone do contato é obrigatório";

  if (body.urgency && !URGENCIES.includes(body.urgency)) return "Urgência inválida";
  return null;
}

export function validateLeadUpdatePayload(body: any): string | null {
  if (!body || typeof body !== "object") return "Payload inválido";
  if (body.urgency !== undefined && body.urgency !== null && !URGENCIES.includes(body.urgency)) {
    return "Urgência inválida";
  }
  return null;
}

export function validateStatusPayload(body: any): string | null {
  if (!body || typeof body !== "object") return "Payload inválido";
  if (!body.status || !LEAD_STATUSES.includes(body.status)) return "Status inválido";
  if (body.closeReason && !CLOSE_REASONS.includes(body.closeReason)) return "Motivo de fechamento inválido";
  return null;
}

export function validateInteractionPayload(body: any, update = false): string | null {
  if (!body || typeof body !== "object") return "Payload inválido";
  if (update) {
    if (!asTrimmedString(body.interactionId)) return "interactionId é obrigatório";
  }
  if (!update && !body.type) return "Tipo é obrigatório";
  if (body.type && !INTERACTION_TYPES.includes(body.type)) return "Tipo de interação inválido";
  if (body.result && !INTERACTION_RESULTS.includes(body.result)) return "Resultado de interação inválido";
  return null;
}

export function validateUserPayload(body: any, update = false): string | null {
  if (!body || typeof body !== "object") return "Payload inválido";

  if (!update) {
    if (!asTrimmedString(body.email)) return "E-mail é obrigatório";
    if (!asTrimmedString(body.name)) return "Nome é obrigatório";
    if (!asTrimmedString(body.password)) return "Senha é obrigatória";
    if (!body.role || !USER_ROLES.includes(body.role)) return "Papel inválido";
  } else if (body.role && !USER_ROLES.includes(body.role)) {
    return "Papel inválido";
  }

  return null;
}
