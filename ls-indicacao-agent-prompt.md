# LS Indicação — Prompt de Construção do Sistema
## Sistema de Indicação de Empresas (PJ) e Gestão de Leads para LS Interbank

---

## 🎯 MISSÃO DO AGENTE

Você é um engenheiro de software sênior full-stack. Sua missão é construir do zero o **LS Indicação**, um sistema web responsivo para centralizar indicações de potenciais clientes PJ (empresas) para a LS Interbank, empresa brasileira de fomento mercantil e antecipação de recebíveis.

O sistema deve ser **production-ready**, seguindo as melhores práticas de 2024-2026, com foco em:
- Segurança (OWASP ASVS Nível 2)
- Compliance LGPD
- Performance e escalabilidade
- UX intuitiva e responsiva
- Código limpo e bem documentado

---

## 📋 CONTEXTO DE NEGÓCIO

### Sobre a LS Interbank
- Empresa de fomento mercantil fundada em 1999 em Belo Horizonte/MG
- Atua com antecipação de recebíveis, cobrança, gestão de riscos
- Público-alvo: PMEs (pequenas e médias empresas) dos setores indústria, comércio, serviços e agronegócio
- Produtos: Antecipação de Recebíveis, Antecipação de Contratos, Cobrança Simples, Gestão de Riscos, Operação Cadeia Produtiva

### Objetivo do Sistema
Centralizar indicações de potenciais clientes feitas por funcionários e parceiros internos, gerenciando o funil desde a indicação até qualificação ou encerramento, com:
- Cadastro de empresas PJ com unicidade por CNPJ
- Distribuição de leads por gerentes para responsáveis
- Timeline de interações (ligações, WhatsApp, emails)
- Dashboards de performance e SLAs
- Auditoria completa de todas as ações

---

## 🛠️ STACK TECNOLÓGICA (OBRIGATÓRIA)

### Frontend
```
- Framework: Next.js 14+ (App Router)
- UI Library: React 18+
- Styling: Tailwind CSS 3.4+
- Componentes: shadcn/ui
- Formulários: React Hook Form + Zod
- State Management: Zustand (global) + React Query (server state)
- Ícones: Lucide React
- Gráficos: Recharts
- Tabelas: TanStack Table
- Data/Hora: date-fns (pt-BR)
- Máscaras: react-input-mask ou similar
```

### Backend
```
- Runtime: Node.js 20+
- Framework: Next.js API Routes (ou separado com Fastify se preferir)
- ORM: Prisma 5+
- Validação: Zod
- Autenticação: NextAuth.js v5 (Auth.js)
- Senhas: bcrypt (cost 12+)
- Rate Limiting: upstash/ratelimit ou similar
```

### Banco de Dados
```
- Database: PostgreSQL 15+
- Provider: Supabase, Neon, ou local Docker
- Migrations: Prisma Migrate
```

### Infraestrutura
```
- Deploy: Vercel (ou Docker + qualquer cloud)
- Storage: Supabase Storage ou S3 (para anexos futuros)
- Email: Resend ou SendGrid (para notificações)
```

---

## 📊 MODELO DE DADOS (PRISMA SCHEMA)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================

enum UserRole {
  ADMIN
  GERENTE
  COORDENADOR
  SUPERVISOR
  RESPONSAVEL
  REGISTRADOR
}

enum LeadStatus {
  PENDENTE
  ATRIBUIDA
  EM_CONTATO
  QUALIFICADA
  ENCERRADA
}

enum InteractionType {
  LIGACAO
  WHATSAPP
  EMAIL
  REUNIAO
  NOTA
}

enum InteractionResult {
  CONECTADO
  SEM_RESPOSTA
  CAIXA_POSTAL
  OCUPADO
  AGENDADO
  ENVIADO
  RECEBIDO
}

enum CloseReason {
  SEM_INTERESSE
  SEM_FIT
  SEM_CONTATO
  JA_CLIENTE
  CONCORRENTE
  TIMING
  DUPLICADA
  SEM_CONSENTIMENTO
  OUTRO
}

enum Urgency {
  BAIXA
  MEDIA
  ALTA
  IMEDIATA
}

enum CompanySize {
  MICRO
  PEQUENA
  MEDIA
  GRANDE
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  STATUS_CHANGE
  ASSIGNMENT
}

// ==================== MODELS ====================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  role          UserRole  @default(REGISTRADOR)
  active        Boolean   @default(true)
  areaId        String?
  area          Area?     @relation(fields: [areaId], references: [id])
  
  // MFA (Fase 2)
  mfaEnabled    Boolean   @default(false)
  mfaSecret     String?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relações
  leadsRegistered   Lead[]        @relation("LeadRegistrador")
  leadsResponsible  Lead[]        @relation("LeadResponsavel")
  interactions      Interaction[]
  statusChanges     StatusHistory[] @relation("StatusChangedBy")
  assignments       Assignment[]    @relation("AssignedBy")
  assignmentsReceived Assignment[]  @relation("AssignedTo")
  auditLogs         AuditLog[]
  
  @@index([email])
  @@index([role])
  @@index([areaId])
}

model Area {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  leads       Lead[]
  
  @@index([name])
}

model Company {
  id            String      @id @default(cuid())
  cnpj          String      @unique @db.VarChar(14) // Apenas números
  razaoSocial   String
  nomeFantasia  String?
  city          String?
  state         String?     @db.Char(2)
  segment       String?
  size          CompanySize?
  website       String?
  
  // LGPD
  consentimento Boolean     @default(false)
  baseLegal     String?     @default("legitimo_interesse")
  
  // Timestamps
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  createdById   String?
  
  // Relações
  contacts      Contact[]
  leads         Lead[]
  
  @@index([cnpj])
  @@index([state])
  @@index([segment])
}

model Contact {
  id          String   @id @default(cuid())
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  name        String
  email       String?
  phone       String?  // Formato: +5531999999999
  whatsapp    String?  // Formato: +5531999999999
  position    String?  // Cargo
  isPrimary   Boolean  @default(false)
  
  // LGPD
  consentimento Boolean @default(false)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Soft delete para LGPD
  deletedAt   DateTime?
  anonymizedAt DateTime?
  
  // Relações
  leads       Lead[]
  
  @@index([companyId])
  @@index([email])
  @@index([phone])
}

model Lead {
  id              String      @id @default(cuid())
  
  // Empresa e Contato
  companyId       String
  company         Company     @relation(fields: [companyId], references: [id])
  contactId       String?
  contact         Contact?    @relation(fields: [contactId], references: [id])
  
  // Usuários
  registradorId   String
  registrador     User        @relation("LeadRegistrador", fields: [registradorId], references: [id])
  responsavelId   String?
  responsavel     User?       @relation("LeadResponsavel", fields: [responsavelId], references: [id])
  
  // Área
  areaId          String?
  area            Area?       @relation(fields: [areaId], references: [id])
  
  // Status
  status          LeadStatus  @default(PENDENTE)
  closeReason     CloseReason?
  closeReasonDetail String?
  
  // Qualificação
  source          String?     // Fonte da indicação
  necessity       String?     // Necessidade/produto de interesse
  estimatedVolume String?     // Faixa: ate_50k, 50k_200k, 200k_500k, acima_500k
  urgency         Urgency?
  notes           String?     @db.Text
  
  // Lead Score (0-100)
  leadScore       Int         @default(0)
  
  // Timestamps importantes
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  assignedAt      DateTime?
  firstContactAt  DateTime?
  qualifiedAt     DateTime?
  closedAt        DateTime?
  
  // Relações
  interactions    Interaction[]
  statusHistory   StatusHistory[]
  assignments     Assignment[]
  
  @@index([companyId])
  @@index([status])
  @@index([responsavelId])
  @@index([registradorId])
  @@index([areaId])
  @@index([createdAt])
}

model Interaction {
  id            String            @id @default(cuid())
  leadId        String
  lead          Lead              @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  authorId      String
  author        User              @relation(fields: [authorId], references: [id])
  
  type          InteractionType
  result        InteractionResult?
  notes         String?           @db.Text
  
  // Próximo passo
  nextStep      String?
  nextStepDate  DateTime?
  
  // Duração (para ligações)
  durationMinutes Int?
  
  // Timestamps
  occurredAt    DateTime          @default(now()) // Quando a interação ocorreu
  createdAt     DateTime          @default(now()) // Quando foi registrada
  
  @@index([leadId])
  @@index([authorId])
  @@index([occurredAt])
  @@index([nextStepDate])
}

model StatusHistory {
  id            String      @id @default(cuid())
  leadId        String
  lead          Lead        @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  previousStatus LeadStatus?
  newStatus     LeadStatus
  reason        String?     // Motivo da mudança (especialmente para encerramento)
  
  changedById   String
  changedBy     User        @relation("StatusChangedBy", fields: [changedById], references: [id])
  changedAt     DateTime    @default(now())
  
  @@index([leadId])
  @@index([changedAt])
}

model Assignment {
  id            String   @id @default(cuid())
  leadId        String
  lead          Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  assignedToId  String
  assignedTo    User     @relation("AssignedTo", fields: [assignedToId], references: [id])
  
  assignedById  String
  assignedBy    User     @relation("AssignedBy", fields: [assignedById], references: [id])
  
  assignedAt    DateTime @default(now())
  notes         String?
  
  @@index([leadId])
  @@index([assignedToId])
  @@index([assignedAt])
}

model AuditLog {
  id          String      @id @default(cuid())
  
  entityType  String      // 'Lead', 'User', 'Company', etc.
  entityId    String
  action      AuditAction
  
  actorId     String?
  actor       User?       @relation(fields: [actorId], references: [id])
  
  oldValues   Json?
  newValues   Json?
  
  ipAddress   String?
  userAgent   String?
  
  timestamp   DateTime    @default(now())
  
  @@index([entityType, entityId])
  @@index([actorId])
  @@index([timestamp])
}

// ==================== CONFIGURAÇÕES ====================

model SystemConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String   @db.Text
  description String?
  updatedAt   DateTime @updatedAt
  updatedById String?
}

model CloseReasonConfig {
  id          String   @id @default(cuid())
  code        String   @unique
  label       String
  description String?
  active      Boolean  @default(true)
  order       Int      @default(0)
}

model SegmentConfig {
  id          String   @id @default(cuid())
  code        String   @unique
  label       String
  active      Boolean  @default(true)
  order       Int      @default(0)
}

model NecessityConfig {
  id          String   @id @default(cuid())
  code        String   @unique
  label       String
  description String?
  active      Boolean  @default(true)
  order       Int      @default(0)
}
```

---

## 🔐 SISTEMA DE PERMISSÕES (RBAC)

### Matriz de Permissões

```typescript
// lib/permissions.ts

export const PERMISSIONS = {
  // LEADS
  'lead:create': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL', 'REGISTRADOR'],
  'lead:read:own': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL', 'REGISTRADOR'],
  'lead:read:team': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR'],
  'lead:read:all': ['ADMIN', 'GERENTE'],
  'lead:update': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR'],
  'lead:delete': ['ADMIN'],
  'lead:assign': ['ADMIN', 'GERENTE', 'COORDENADOR'],
  'lead:reassign': ['ADMIN', 'GERENTE', 'COORDENADOR'],
  'lead:change_status': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL'],
  'lead:close': ['ADMIN', 'GERENTE', 'COORDENADOR', 'RESPONSAVEL'],
  
  // INTERAÇÕES
  'interaction:create': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL'],
  'interaction:read': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL'],
  'interaction:update': ['ADMIN', 'GERENTE'],
  
  // EMPRESAS
  'company:create': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL', 'REGISTRADOR'],
  'company:read': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL', 'REGISTRADOR'],
  'company:update': ['ADMIN', 'GERENTE', 'COORDENADOR'],
  
  // CONTATOS
  'contact:create': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL', 'REGISTRADOR'],
  'contact:read': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL'],
  'contact:update': ['ADMIN', 'GERENTE', 'COORDENADOR'],
  
  // USUÁRIOS
  'user:create': ['ADMIN'],
  'user:read': ['ADMIN', 'GERENTE'],
  'user:update': ['ADMIN'],
  'user:delete': ['ADMIN'],
  
  // CONFIGURAÇÕES
  'config:read': ['ADMIN', 'GERENTE'],
  'config:update': ['ADMIN'],
  
  // DASHBOARDS
  'dashboard:personal': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR', 'RESPONSAVEL', 'REGISTRADOR'],
  'dashboard:team': ['ADMIN', 'GERENTE', 'COORDENADOR', 'SUPERVISOR'],
  'dashboard:global': ['ADMIN', 'GERENTE'],
  
  // RELATÓRIOS
  'report:view': ['ADMIN', 'GERENTE', 'COORDENADOR'],
  'report:export': ['ADMIN', 'GERENTE'],
  
  // AUDITORIA
  'audit:view': ['ADMIN', 'GERENTE'],
  'audit:export': ['ADMIN'],
} as const;

export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[permission]?.includes(userRole as any) ?? false;
}

export function canAccessLead(user: User, lead: Lead): boolean {
  // Admin e Gerente veem tudo
  if (['ADMIN', 'GERENTE'].includes(user.role)) return true;
  
  // Coordenador/Supervisor veem da sua área
  if (['COORDENADOR', 'SUPERVISOR'].includes(user.role)) {
    return lead.areaId === user.areaId;
  }
  
  // Responsável vê seus leads
  if (user.role === 'RESPONSAVEL') {
    return lead.responsavelId === user.id;
  }
  
  // Registrador vê apenas leads que ele criou
  if (user.role === 'REGISTRADOR') {
    return lead.registradorId === user.id;
  }
  
  return false;
}
```

---

## 📐 ESTRUTURA DE PASTAS

```
ls-indicacao/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── leads/
│   │   │   ├── page.tsx                # Lista de leads
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Nova indicação
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Detalhes do lead
│   │   │       └── edit/
│   │   │           └── page.tsx        # Editar lead
│   │   ├── empresas/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── relatorios/
│   │   │   └── page.tsx
│   │   ├── usuarios/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── configuracoes/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── leads/
│   │   │   ├── route.ts                # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts            # GET, PUT, DELETE
│   │   │   │   ├── assign/
│   │   │   │   │   └── route.ts        # POST
│   │   │   │   ├── status/
│   │   │   │   │   └── route.ts        # PUT
│   │   │   │   └── interactions/
│   │   │   │       └── route.ts        # GET, POST
│   │   │   └── check-cnpj/
│   │   │       └── route.ts            # POST - Verificar duplicata
│   │   ├── companies/
│   │   │   └── route.ts
│   │   ├── users/
│   │   │   └── route.ts
│   │   ├── dashboard/
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   └── funnel/
│   │   │       └── route.ts
│   │   └── config/
│   │       └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── forms/
│   │   ├── lead-form.tsx
│   │   ├── interaction-form.tsx
│   │   ├── company-form.tsx
│   │   └── user-form.tsx
│   ├── leads/
│   │   ├── lead-card.tsx
│   │   ├── lead-table.tsx
│   │   ├── lead-timeline.tsx
│   │   ├── lead-status-badge.tsx
│   │   ├── lead-assign-dialog.tsx
│   │   └── lead-close-dialog.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── funnel-chart.tsx
│   │   ├── aging-alerts.tsx
│   │   ├── pending-queue.tsx
│   │   └── performance-table.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── user-nav.tsx
│   │   └── mobile-nav.tsx
│   └── shared/
│       ├── cnpj-input.tsx
│       ├── phone-input.tsx
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       └── data-table.tsx
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   ├── auth.ts                         # Auth.js config
│   ├── permissions.ts                  # RBAC logic
│   ├── validations/
│   │   ├── lead.ts                     # Zod schemas para leads
│   │   ├── company.ts
│   │   ├── user.ts
│   │   └── interaction.ts
│   ├── utils/
│   │   ├── cnpj.ts                     # Validação e formatação CNPJ
│   │   ├── phone.ts                    # Validação e formatação telefone
│   │   ├── date.ts                     # Helpers de data
│   │   └── lead-score.ts               # Cálculo do lead score
│   ├── actions/
│   │   ├── lead-actions.ts             # Server actions para leads
│   │   ├── company-actions.ts
│   │   └── user-actions.ts
│   └── hooks/
│       ├── use-leads.ts
│       ├── use-dashboard.ts
│       └── use-permissions.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── logo.svg
├── types/
│   └── index.ts                        # TypeScript types
├── middleware.ts                       # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🖥️ TELAS E COMPONENTES (MVP)

### 1. Tela de Login (`/login`)
```
┌─────────────────────────────────────────┐
│              🏦 LS INDICAÇÃO            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Email                             │  │
│  │ [________________________]        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Senha                             │  │
│  │ [________________________] 👁️     │  │
│  └───────────────────────────────────┘  │
│                                         │
│        [ Entrar ]                       │
│                                         │
│  Esqueceu a senha? →                    │
└─────────────────────────────────────────┘
```

**Requisitos:**
- Validação de email e senha
- Mensagem de erro clara para credenciais inválidas
- Bloqueio após 5 tentativas falhas (15 min)
- Redirect para dashboard após login
- Responsivo

---

### 2. Dashboard Principal (`/`)

**Para Gerente:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard                                           👤 João Silva │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │   12    │ │    5    │ │   89%   │ │   32%   │                   │
│  │ Novos   │ │Pendentes│ │ No SLA  │ │Conversão│                   │
│  │ (mês)   │ │(atribuir)│ │        │ │         │                   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │
│                                                                     │
│  ┌─────────────────────────┐ ┌────────────────────────────────────┐│
│  │    FUNIL DE LEADS       │ │  ⚠️ ALERTAS DE AGING              ││
│  │ ████████████ 45 Pendente│ │                                    ││
│  │ ██████████ 38 Atribuída │ │  🔴 Lead #123 - 3 dias sem contato ││
│  │ ████████ 25 Em contato  │ │  🟡 Lead #456 - 2 dias pendente    ││
│  │ ████ 12 Qualificada     │ │  🟡 Lead #789 - Follow-up vencido  ││
│  │ ██████ 20 Encerrada     │ │                                    ││
│  └─────────────────────────┘ └────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📋 FILA PENDENTE (Aguardando Atribuição)                      ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Empresa          │ Contato      │ Há      │ Score │ Ação       ││
│  │ Empresa ABC Ltda │ João Silva   │ 2h      │ 75    │ [Atribuir] ││
│  │ XYZ Comércio     │ Maria Santos │ 4h ⚠️   │ 60    │ [Atribuir] ││
│  │ Tech Solutions   │ Pedro Lima   │ 1 dia 🔴│ 45    │ [Atribuir] ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📊 PERFORMANCE DA EQUIPE (Mês)                                ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Responsável     │ Atribuídos │ Qualificados │ Taxa  │ Tempo 1º ││
│  │ Ana Costa       │ 15         │ 6            │ 40%   │ 2h       ││
│  │ Carlos Mendes   │ 12         │ 4            │ 33%   │ 4h       ││
│  │ Julia Ferreira  │ 18         │ 5            │ 28%   │ 3h       ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Para Responsável:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏠 Minha Carteira                                     👤 Ana Costa │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │    8    │ │    3    │ │   40%   │ │    2    │                   │
│  │ Meus    │ │ Em      │ │Conversão│ │ Follow  │                   │
│  │ Leads   │ │ Contato │ │ (mês)   │ │ Ups Hoje│                   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📋 MEUS LEADS                                    [+ Registrar] ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Status      │ Empresa          │ Último Contato │ Próx. Ação   ││
│  │ 🟡 Atribuída│ Nova Tech Ltda   │ -              │ Ligar hoje   ││
│  │ 🔵 Em contato│ ABC Indústria   │ Ontem          │ Enviar prop. ││
│  │ 🔵 Em contato│ Comércio XYZ    │ Há 3 dias 🔴   │ Follow-up    ││
│  │ 🟢 Qualificada│ Tech Solutions │ 2 dias         │ -            ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  📅 PRÓXIMOS FOLLOW-UPS                                        ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Hoje     │ ABC Indústria - Ligar para confirmar interesse      ││
│  │ Hoje     │ Nova Tech - Enviar documentação                     ││
│  │ Amanhã   │ Comércio XYZ - Reunião agendada 14h                 ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3. Nova Indicação (`/leads/new`)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Voltar    📝 Nova Indicação                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ DADOS DA EMPRESA                                               ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                 ││
│  │  CNPJ *                                                         ││
│  │  [12.345.678/0001-90    ] [Verificar]                          ││
│  │  ✅ CNPJ válido e disponível                                   ││
│  │                                                                 ││
│  │  Razão Social / Nome da Empresa *                              ││
│  │  [____________________________________]                        ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ DADOS DO CONTATO                                               ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                 ││
│  │  Nome do Contato *                                             ││
│  │  [____________________________________]                        ││
│  │                                                                 ││
│  │  Telefone/WhatsApp *            Email                          ││
│  │  [(31) 99999-9999    ]          [________________@_____.___ ]  ││
│  │                                                                 ││
│  │  Cargo                                                          ││
│  │  [____________________________________]                        ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ INFORMAÇÕES ADICIONAIS (Opcional)                              ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                 ││
│  │  Cidade            UF        Segmento                          ││
│  │  [____________]   [MG ▼]    [Selecione...          ▼]          ││
│  │                                                                 ││
│  │  Necessidade Identificada          Urgência                    ││
│  │  [Antecipação de Recebíveis  ▼]   [Média  ▼]                   ││
│  │                                                                 ││
│  │  Observações                                                    ││
│  │  [                                                    ]        ││
│  │  [                                                    ]        ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ☑️ O contato autorizou receber informações da LS Interbank       │
│                                                                     │
│           [Cancelar]   [Salvar Indicação]                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Comportamento de Duplicata:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  CNPJ *                                                            │
│  [12.345.678/0001-90    ] [Verificar]                              │
│  ⚠️ Empresa já cadastrada!                                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Esta empresa já existe no sistema:                            │ │
│  │ ABC Indústria Ltda                                            │ │
│  │ Status atual: Em Contato | Responsável: Carlos Silva          │ │
│  │                                                               │ │
│  │ [Ver Lead Existente →]                                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 4. Detalhes do Lead (`/leads/[id]`)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Leads    ABC Indústria Ltda                        [Editar] [⚙️] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐  ┌────────────────────────────────────────┐│
│  │ Status: 🔵 Em Contato│  │ Score: ████████░░ 75/100             ││
│  │ [Alterar Status ▼]  │  │ Criado: 15/01/2026 por Maria Santos   ││
│  └─────────────────────┘  │ Atribuído: 16/01/2026 para Carlos     ││
│                           └────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🏢 DADOS DA EMPRESA                                            ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ CNPJ: 12.345.678/0001-90                                       ││
│  │ Razão Social: ABC Indústria e Comércio Ltda                    ││
│  │ Cidade/UF: Belo Horizonte/MG                                   ││
│  │ Segmento: Indústria                                            ││
│  │ Porte: Pequena Empresa                                         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 👤 CONTATO PRINCIPAL                                           ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Nome: João da Silva                                            ││
│  │ Cargo: Diretor Financeiro                                      ││
│  │ Telefone: (31) 99999-9999  [📞 Ligar] [💬 WhatsApp]           ││
│  │ Email: joao@abcindustria.com.br                                ││
│  │ ☑️ Autorizou contato                                          ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 📋 QUALIFICAÇÃO                                                ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │ Necessidade: Antecipação de Recebíveis                         ││
│  │ Volume Estimado: R$ 200k - R$ 500k/mês                         ││
│  │ Urgência: Alta                                                 ││
│  │ Observações: Empresa em expansão, abriu nova filial...         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 📜 TIMELINE DE INTERAÇÕES                   [+ Nova Interação] ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                 ││
│  │ 📞 Ligação • 18/01/2026 14:30 • Carlos Mendes                  ││
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ Resultado: Conectado                                        │││
│  │ │ Cliente demonstrou interesse. Solicitou proposta formal     │││
│  │ │ com condições de antecipação.                               │││
│  │ │ Próximo: Enviar proposta até 20/01                          │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  │                                                                 ││
│  │ 📱 WhatsApp • 17/01/2026 10:15 • Carlos Mendes                 ││
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ Resultado: Enviado                                          │││
│  │ │ Enviada apresentação institucional da LS Interbank          │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  │                                                                 ││
│  │ 🔄 Sistema • 16/01/2026 09:00                                  ││
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ Lead atribuído a Carlos Mendes por Maria Santos (Gerente)   │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  │                                                                 ││
│  │ 🔄 Sistema • 15/01/2026 16:45                                  ││
│  │ ┌─────────────────────────────────────────────────────────────┐││
│  │ │ Lead criado por Maria Santos (Registrador)                  │││
│  │ └─────────────────────────────────────────────────────────────┘││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5. Modal de Nova Interação

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📝 Registrar Interação                                         ✕  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Tipo de Interação *                                               │
│  [📞 Ligação         ▼]                                            │
│                                                                     │
│  Resultado *                                                        │
│  [Conectado          ▼]                                            │
│                                                                     │
│  Data/Hora                                                          │
│  [18/01/2026] [14:30]                                              │
│                                                                     │
│  Duração (minutos)                                                  │
│  [15        ]                                                       │
│                                                                     │
│  Anotações *                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Cliente demonstrou interesse em antecipação de duplicatas.     ││
│  │ Atualmente trabalha com banco tradicional mas reclama da       ││
│  │ burocracia. Solicitou proposta formal.                         ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ☑️ Agendar próximo passo                                          │
│                                                                     │
│  Próximo Passo                                                      │
│  [Enviar proposta comercial por email                         ]    │
│                                                                     │
│  Data                                                               │
│  [20/01/2026]                                                       │
│                                                                     │
│                        [Cancelar]   [Salvar]                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 6. Modal de Atribuição

```
┌─────────────────────────────────────────────────────────────────────┐
│ 👤 Atribuir Lead                                               ✕  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Lead: ABC Indústria Ltda                                          │
│  CNPJ: 12.345.678/0001-90                                          │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Selecione o Responsável *                                         │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ○ Carlos Mendes                                                ││
│  │   Carteira: 8 leads | Conversão: 35%                           ││
│  │                                                                 ││
│  │ ○ Ana Costa                                                     ││
│  │   Carteira: 12 leads | Conversão: 42%                          ││
│  │                                                                 ││
│  │ ○ Julia Ferreira                                                ││
│  │   Carteira: 6 leads | Conversão: 38%                           ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Observação (opcional)                                              │
│  [Prioridade alta - cliente precisa de resposta rápida      ]      │
│                                                                     │
│                        [Cancelar]   [Atribuir]                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 7. Modal de Encerramento

```
┌─────────────────────────────────────────────────────────────────────┐
│ ❌ Encerrar Lead                                               ✕  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ⚠️ Esta ação não pode ser desfeita.                              │
│                                                                     │
│  Lead: ABC Indústria Ltda                                          │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Motivo do Encerramento *                                          │
│  [Selecione um motivo...                               ▼]          │
│                                                                     │
│  • Sem interesse no momento                                         │
│  • Fora do perfil (sem fit)                                        │
│  • Não foi possível contato                                        │
│  • Já é cliente LS Interbank                                       │
│  • Optou por concorrente                                           │
│  • Timing inadequado (retornar futuro)                             │
│  • Lead duplicado                                                   │
│  • Sem consentimento para contato                                  │
│  • Outro motivo                                                     │
│                                                                     │
│  Detalhes (obrigatório se "Outro") *                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│                        [Cancelar]   [Confirmar Encerramento]       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 VALIDAÇÕES E REGRAS DE NEGÓCIO

### Validação de CNPJ
```typescript
// lib/utils/cnpj.ts

export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) return false;
  
  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Validação dos dígitos verificadores (Módulo 11)
  const calcDigit = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(base[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const digit1 = calcDigit(cleaned.substring(0, 12), weights1);
  const digit2 = calcDigit(cleaned.substring(0, 12) + digit1, weights2);
  
  return cleaned.endsWith(`${digit1}${digit2}`);
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}
```

### Validação de Telefone
```typescript
// lib/utils/phone.ts

export function validateBrazilianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Aceita: (DDD) + 8 ou 9 dígitos
  return /^[1-9]{2}[2-9]\d{7,8}$/.test(cleaned);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

export function toE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `+55${cleaned}`;
}
```

### Cálculo do Lead Score
```typescript
// lib/utils/lead-score.ts

interface LeadScoreInput {
  hasEmail: boolean;
  hasPhone: boolean;
  hasSegment: boolean;
  hasSize: boolean;
  hasNecessity: boolean;
  hasUrgency: boolean;
  hasConsent: boolean;
  urgency?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'IMEDIATA';
  segmentFit: boolean; // Segmento dentro do ICP
  sizeFit: boolean;    // Porte dentro do ICP
}

export function calculateLeadScore(input: LeadScoreInput): number {
  let score = 0;
  
  // Completude (0-40 pontos)
  if (input.hasPhone) score += 10;    // Obrigatório mas valorizado
  if (input.hasEmail) score += 5;
  if (input.hasSegment) score += 8;
  if (input.hasSize) score += 5;
  if (input.hasNecessity) score += 7;
  if (input.hasUrgency) score += 5;
  
  // Fit (0-40 pontos)
  if (input.segmentFit) score += 20;
  if (input.sizeFit) score += 15;
  if (input.hasConsent) score += 5;
  
  // Engajamento (0-20 pontos)
  switch (input.urgency) {
    case 'IMEDIATA': score += 20; break;
    case 'ALTA': score += 15; break;
    case 'MEDIA': score += 10; break;
    case 'BAIXA': score += 5; break;
  }
  
  return Math.min(score, 100);
}
```

### Regras de Transição de Status
```typescript
// lib/utils/status-transitions.ts

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDENTE: ['ATRIBUIDA', 'ENCERRADA'],
  ATRIBUIDA: ['EM_CONTATO', 'ENCERRADA'],
  EM_CONTATO: ['QUALIFICADA', 'ENCERRADA'],
  QUALIFICADA: ['ENCERRADA'],
  ENCERRADA: [], // Estado final
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(currentStatus: string): string[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}
```

---

## 📊 ENDPOINTS DA API

### Leads
```typescript
// POST /api/leads - Criar lead
// Body: { cnpj, companyName, contactName, phone, email?, ... }
// Response: { id, status, ... }

// GET /api/leads - Listar leads
// Query: ?status=PENDENTE&page=1&limit=20&responsavelId=...
// Response: { data: Lead[], total, page, totalPages }

// GET /api/leads/[id] - Detalhes do lead
// Response: Lead com company, contact, interactions, statusHistory

// PUT /api/leads/[id] - Atualizar lead
// Body: { segmento?, necessidade?, ... }

// POST /api/leads/[id]/assign - Atribuir lead
// Body: { responsavelId, notes? }

// PUT /api/leads/[id]/status - Alterar status
// Body: { status, closeReason?, closeReasonDetail? }

// POST /api/leads/[id]/interactions - Nova interação
// Body: { type, result?, notes, nextStep?, nextStepDate? }

// POST /api/leads/check-cnpj - Verificar duplicata
// Body: { cnpj }
// Response: { exists, leadId?, companyName?, status? }
```

### Dashboard
```typescript
// GET /api/dashboard/stats
// Response: { 
//   created: number, 
//   pending: number, 
//   slaCompliance: number, 
//   conversionRate: number 
// }

// GET /api/dashboard/funnel
// Response: { 
//   pendente: number, 
//   atribuida: number, 
//   emContato: number, 
//   qualificada: number, 
//   encerrada: number 
// }

// GET /api/dashboard/aging
// Response: { 
//   alerts: Array<{ leadId, company, days, type }> 
// }

// GET /api/dashboard/performance
// Response: { 
//   users: Array<{ userId, name, assigned, qualified, rate, avgTime }> 
// }
```

---

## 🎨 DESIGN SYSTEM

### Cores
```css
/* Tailwind config - cores principais */
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  /* Azul principal */
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: '#22c55e',  /* Verde */
  warning: '#f59e0b',  /* Amarelo */
  danger: '#ef4444',   /* Vermelho */
  
  /* Status dos leads */
  status: {
    pendente: '#f59e0b',    /* Amarelo */
    atribuida: '#8b5cf6',   /* Roxo */
    emContato: '#3b82f6',   /* Azul */
    qualificada: '#22c55e', /* Verde */
    encerrada: '#6b7280',   /* Cinza */
  }
}
```

### Badges de Status
```tsx
const statusConfig = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  ATRIBUIDA: { label: 'Atribuída', color: 'bg-purple-100 text-purple-800', icon: UserCheck },
  EM_CONTATO: { label: 'Em Contato', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  QUALIFICADA: { label: 'Qualificada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  ENCERRADA: { label: 'Encerrada', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};
```

---

## 🔒 CHECKLIST DE SEGURANÇA

### Autenticação
- [ ] Senhas com bcrypt (cost 12+)
- [ ] Sessões com timeout de 8 horas
- [ ] Bloqueio após 5 tentativas falhas
- [ ] Tokens JWT com expiração curta
- [ ] Refresh tokens com rotação

### Autorização
- [ ] RBAC em todas as rotas da API
- [ ] Verificação de ownership (lead pertence ao usuário?)
- [ ] Deny by default

### Validação
- [ ] Zod em todas as entradas
- [ ] Sanitização de strings
- [ ] Validação de CNPJ server-side
- [ ] Queries parametrizadas (Prisma já faz)

### Headers
- [ ] HTTPS obrigatório
- [ ] Strict-Transport-Security
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] CORS restrito

### Rate Limiting
- [ ] Login: 5 req/min por IP
- [ ] API geral: 100 req/min por usuário
- [ ] Create lead: 20 req/min

---

## 📋 CHECKLIST LGPD

- [ ] Campo de consentimento no cadastro
- [ ] Base legal documentada (legítimo interesse)
- [ ] Minimização de dados (apenas necessários)
- [ ] Soft delete com possibilidade de anonimização
- [ ] Endpoint para exportação de dados do titular
- [ ] Endpoint para exclusão/anonimização
- [ ] Auditoria de quem acessou dados pessoais

---

## 🚀 INSTRUÇÕES DE EXECUÇÃO

### Passo 1: Setup Inicial
```bash
# Criar projeto Next.js
npx create-next-app@latest ls-indicacao --typescript --tailwind --eslint --app

# Instalar dependências
cd ls-indicacao
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query @tanstack/react-table
npm install zustand
npm install recharts
npm install lucide-react
npm install date-fns
npm install bcryptjs
npm install @upstash/ratelimit @upstash/redis

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input label card table dialog select badge toast tabs avatar dropdown-menu separator sheet skeleton

# Prisma
npx prisma init
```

### Passo 2: Configurar Banco
```bash
# Criar banco PostgreSQL (local ou Supabase/Neon)
# Copiar .env.example para .env e configurar DATABASE_URL

# Rodar migrations
npx prisma migrate dev --name init

# Seed inicial (criar admin)
npx prisma db seed
```

### Passo 3: Desenvolvimento
```bash
npm run dev
# Acesse http://localhost:3000
```

---

## ✅ CRITÉRIOS DE ACEITE DO MVP

1. **Autenticação**
   - [ ] Login funcional com email/senha
   - [ ] Sessões persistentes
   - [ ] Logout funcional
   - [ ] Redirecionamento adequado

2. **Cadastro de Lead**
   - [ ] Formulário com campos obrigatórios
   - [ ] Validação de CNPJ em tempo real
   - [ ] Bloqueio de duplicatas
   - [ ] Redirecionamento para lead existente

3. **Fila de Pendentes**
   - [ ] Lista ordenada por data
   - [ ] Indicadores de aging
   - [ ] Ação de atribuir funcional

4. **Gestão de Status**
   - [ ] Transições válidas apenas
   - [ ] Motivo obrigatório no encerramento
   - [ ] Timeline atualizada

5. **Dashboard**
   - [ ] Cards com métricas corretas
   - [ ] Funil visual
   - [ ] Lista de alertas

6. **Permissões**
   - [ ] Cada papel vê apenas o permitido
   - [ ] Ações bloqueadas server-side

---

## 🎯 COMECE AGORA

**Ordem de implementação sugerida:**

1. Setup do projeto e Prisma schema
2. Autenticação (NextAuth)
3. Layout base (Sidebar, Header)
4. CRUD de Leads (criar, listar, detalhar)
5. Verificação de duplicata CNPJ
6. Atribuição de leads
7. Timeline de interações
8. Mudança de status + encerramento
9. Dashboard com métricas
10. Refinamentos de UX e responsividade

**Comece pelo setup do projeto e schema do Prisma. Depois implemente a autenticação. O resto virá naturalmente seguindo o fluxo do usuário.**

---

*Este documento serve como especificação completa. Consulte-o sempre que tiver dúvidas sobre regras de negócio, estrutura de dados ou comportamento esperado.*
