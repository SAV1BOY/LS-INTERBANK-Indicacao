import { UserRole } from "@prisma/client";

export const PERMISSIONS = {
  // Leads
  'lead:create': ['ADMIN', 'ALIADO'], // Gerente cria prospecção, não indicação
  'lead:read:own': ['ADMIN', 'GERENTE', 'ALIADO'],
  'lead:read:all': ['ADMIN'], // Apenas Admin vê todos
  'lead:update': ['ADMIN', 'GERENTE'],
  'lead:delete': ['ADMIN'],
  'lead:assign': ['ADMIN', 'ALIADO'], // Admin atribui, Aliado atribui suas indicações
  'lead:change_status': ['ADMIN', 'GERENTE'],
  'lead:close': ['ADMIN', 'GERENTE'],
  // Interações
  'interaction:create': ['ADMIN', 'GERENTE'],
  'interaction:read': ['ADMIN', 'GERENTE'],
  'interaction:update': ['ADMIN', 'GERENTE'],
  // Empresas - Prospecção própria do Gerente
  'company:create': ['ADMIN', 'GERENTE', 'ALIADO'],
  'company:read': ['ADMIN', 'GERENTE'], // Aliado NÃO vê aba Empresas
  'company:update': ['ADMIN', 'GERENTE'],
  'prospeccao:create': ['ADMIN', 'GERENTE'], // Prospecção própria
  'prospeccao:read': ['ADMIN', 'GERENTE'],
  // Contatos
  'contact:create': ['ADMIN', 'GERENTE', 'ALIADO'],
  'contact:read': ['ADMIN', 'GERENTE'],
  'contact:update': ['ADMIN', 'GERENTE'],
  // Usuários - Apenas Admin
  'user:create': ['ADMIN'],
  'user:read': ['ADMIN'],
  'user:update': ['ADMIN'],
  'user:delete': ['ADMIN'],
  // Configurações
  'config:read': ['ADMIN'],
  'config:update': ['ADMIN'],
  // Dashboard
  'dashboard:personal': ['ADMIN', 'GERENTE', 'ALIADO'],
  'dashboard:global': ['ADMIN'],
  'dashboard:team': ['ADMIN'],
  // Relatórios e Exportação
  'report:view': ['ADMIN', 'GERENTE'],
  'report:export': ['ADMIN', 'GERENTE'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[] | undefined;
  return allowedRoles?.includes(userRole) ?? false;
}

/**
 * Verifica se o usuário pode acessar um lead específico
 * - ADMIN: acesso total
 * - GERENTE: apenas leads atribuídos a ele (responsavelId === userId)
 * - ALIADO: apenas leads que ele cadastrou (registradorId === userId)
 */
export function canAccessLead(
  userRole: string, 
  userId: string, 
  lead: { registradorId: string; responsavelId?: string | null; isProspeccao?: boolean }
): boolean {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'GERENTE') {
    // Gerente vê apenas leads atribuídos a ele OU prospecções próprias dele
    return lead.responsavelId === userId || (Boolean(lead.isProspeccao) && lead.registradorId === userId);
  }
  if (userRole === 'ALIADO') {
    // Aliado vê apenas leads que ele cadastrou
    return lead.registradorId === userId;
  }
  return false;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  ALIADO: 'Aliado',
};
