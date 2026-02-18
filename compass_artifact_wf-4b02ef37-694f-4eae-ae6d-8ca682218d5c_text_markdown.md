# LS Indicação: PRD Completo e Guia de Implementação
## Sistema de Indicação de Empresas e Gestão de Leads para LS Interbank

**Resumo Executivo:** Este documento apresenta o Product Requirements Document (PRD) completo para o aplicativo LS Indicação, um sistema web/mobile de indicação de empresas (PJ) e gestão de leads para a LS Interbank, empresa mineira de fomento mercantil com mais de 25 anos no mercado. O sistema centraliza indicações de potenciais clientes, permite gestão de atribuições por gerentes, e rastreia interações em uma timeline unificada. A solução prioriza simplicidade no MVP, compliance com LGPD, e preparação para integrações futuras.

---

## Parte 1: Contexto de Negócio e Mercado

### O mercado de fomento mercantil no Brasil

O mercado brasileiro de factoring conta com aproximadamente **1.580 empresas**, atendendo mais de **65.000 PMEs** com faturamento mensal estimado em **US$ 1 bilhão**. A LS Interbank, fundada em 1999 em Belo Horizonte, posiciona-se entre as maiores instituições de fomento de Minas Gerais, com operações reguladas pela CVM e ANBIMA através de seu FIDC próprio.

O diferencial competitivo do factoring em relação aos bancos tradicionais está na **flexibilidade de análise de crédito** e na **velocidade de liberação de recursos** — frequentemente no mesmo dia. Enquanto bancos tradicionais aprovam apenas **14,6%** das solicitações de PMEs, empresas de factoring alcançam taxas de **60-85%**, tornando-se alternativa crucial para capital de giro.

### Portfólio de produtos LS Interbank

A LS Interbank oferece cinco produtos principais que definem o perfil de lead ideal:

| Produto | Descrição | Necessidade do Cliente |
|---------|-----------|------------------------|
| **Antecipação de Recebíveis** | Transformação de vendas a prazo em capital imediato via desconto de duplicatas, cheques e notas promissórias | Liquidez imediata sem gerar dívida bancária |
| **Antecipação de Contratos** | Desconto especializado para empresas cujos clientes pagam apenas via crédito em conta | Clientes de grandes corporações com políticas de pagamento restritas |
| **Cobrança Simples** | Terceirização de gestão de recebíveis com emissão de boletos | Redução de carga administrativa |
| **Gestão de Riscos** | Consultoria para avaliação de risco de carteira de clientes | Decisões de crédito mais assertivas |
| **Operação Cadeia Produtiva** | Financiamento via parcerias com empresas-âncora nacionais | Fornecedores de grandes empresas buscando capital rápido |

### Perfil do cliente ideal (ICP)

O lead ideal para LS Interbank apresenta as seguintes características:

- **Porte:** Pequenas (até R$ 4,8M/ano) e médias empresas (R$ 4,8M a R$ 50M/ano)
- **Setores:** Indústria, comércio, serviços e agronegócio
- **Modelo de venda:** B2B com prazos de 30-90 dias
- **Necessidade:** Capital de giro, liquidez, alternativa a empréstimos bancários
- **Geografia primária:** Sudeste e Centro-Oeste, com cobertura nacional
- **Requisitos:** Vendas documentadas (NF-e), clientes (sacados) com boa capacidade de pagamento

---

## Parte 2: Benchmarks Globais — Práticas de Referência

### Estratégias de aquisição em factoring global

A pesquisa de empresas globais de invoice financing revela padrões claros de aquisição que podem informar o design do LS Indicação:

| Empresa | Estratégia Principal | Programa de Parceiros |
|---------|---------------------|----------------------|
| **Fundbox** (US) | API-first, integração com QuickBooks/FreshBooks | Portal de parceiros, comissão por originação |
| **BlueVine** (US) | Rede de 4.000+ contadores e advogados | Account Executives dedicados por parceiro |
| **C2FO** (Global) | Modelo buyer-centric via empresas-âncora | Parcerias com EY, PwC, integradores |
| **Credibly** (US) | Modelo dual: brokers vs referral partners | Portal com calculadora de comissão |

**Insight crítico:** Empresas de factoring bem-sucedidas utilizam **modelos de parceria estruturados** com portais self-service, rastreamento transparente de status, e pagamento automatizado de comissões.

### Campos de qualificação padrão da indústria

| Categoria | Campos Obrigatórios | Campos de Enriquecimento |
|-----------|--------------------|-----------------------|
| **Empresa** | Nome legal, CNPJ/Tax ID, setor/CNAE | Porte, faturamento, tempo de atividade |
| **Contato** | Nome, email, telefone/WhatsApp | Cargo, autoridade de decisão |
| **Necessidade** | Tipo de serviço, urgência | Volume estimado, prazo de recebíveis |
| **Recebíveis** | Tipo de cliente (B2B/B2G) | Aging de carteira, concentração de clientes |

### Plataformas de referral management — lições de UX

A análise de PartnerStack, Referral Rock, Kiflo e CRMs líderes identificou padrões essenciais:

**Registro de leads:**
- Formulários com **5-7 campos obrigatórios** máximo
- Validação de duplicatas em **tempo real** (antes de submeter)
- Links de referência únicos por parceiro para rastreamento automático

**Gestão de status:**
- Modelo de 4 estágios padrão: Pending → Qualified → Approved/Denied
- Visibilidade de status para o parceiro em tempo real
- Notificações push/email em mudanças de status

**Deduplicação:**
- Email + domínio da empresa como chave composta primária
- Para Brasil: **CNPJ como unique constraint** (mais confiável que email)
- Janela de proteção de 60-90 dias para o parceiro que indicou primeiro

---

## Parte 3: PRD Completo — Personas e Jornadas

### Personas detalhadas

#### Persona 1: Registrador/Parceiro
**Perfil:** Funcionário de agência, parceiro externo (contador, advogado, consultor), ou colaborador interno com acesso ao mercado.

**Objetivos:**
- Registrar indicações de forma rápida com dados mínimos
- Acompanhar o status das indicações feitas
- Receber feedback sobre conversões (futuro: comissões)

**Frustrações:**
- Formulários longos e burocráticos
- Falta de visibilidade sobre o andamento da indicação
- Duplicação de esforço ao indicar empresa já cadastrada

**Jornada típica:**
1. Identifica empresa com potencial necessidade de capital de giro
2. Acessa app via mobile ou web → tela de nova indicação
3. Digita CNPJ → sistema valida e verifica duplicatas
4. Se novo: preenche dados mínimos (nome empresa, contato, telefone)
5. Submete → recebe confirmação com número da indicação
6. Acompanha status via dashboard "Minhas Indicações"

#### Persona 2: Responsável (Owner)
**Perfil:** Analista comercial ou consultor de negócios designado para trabalhar o lead.

**Objetivos:**
- Receber leads qualificados para contato
- Registrar todas as interações (ligações, WhatsApp, emails)
- Avançar leads pelo funil até qualificação ou encerramento

**Frustrações:**
- Leads com dados incompletos ou incorretos
- Falta de histórico de tentativas anteriores
- Pressão por SLA sem ferramentas adequadas

**Jornada típica:**
1. Recebe notificação de lead atribuído
2. Acessa ficha do lead → vê dados e histórico
3. Realiza primeira tentativa de contato → registra na timeline
4. Agenda próximo passo ou atualiza status
5. Repete ciclo até qualificar ou encerrar com motivo

#### Persona 3: Gerente/Coordenador
**Perfil:** Gestor de equipe comercial responsável por distribuição de leads e acompanhamento de performance.

**Objetivos:**
- Distribuir leads rapidamente para responsáveis
- Monitorar SLAs e identificar gargalos
- Analisar performance por responsável e fonte

**Frustrações:**
- Leads acumulando sem atribuição
- Falta de visibilidade sobre follow-ups
- Relatórios manuais e desatualizados

**Jornada típica:**
1. Acessa dashboard gerencial → vê fila de pendentes
2. Analisa lead e decide responsável ideal
3. Atribui lead → responsável é notificado
4. Monitora aging e SLA compliance
5. Intervém em leads com aging crítico

#### Persona 4: Administrador
**Perfil:** Usuário técnico/negócio responsável por configurações do sistema.

**Objetivos:**
- Gerenciar usuários e permissões
- Configurar regras de negócio (status, motivos, SLAs)
- Acessar auditoria completa

**Responsabilidades:**
- Onboarding de novos usuários
- Manutenção de tabelas auxiliares
- Exportação de dados e relatórios

### Funil de leads — Estados e transições

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FUNIL LS INDICAÇÃO                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐                                                   │
│   │  PENDENTE   │ ← Lead criado, aguardando revisão/atribuição      │
│   └──────┬──────┘                                                   │
│          │ Gerente revisa e atribui                                 │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │  ATRIBUÍDA  │ ← Owner designado, SLA de primeiro contato        │
│   └──────┬──────┘                                                   │
│          │ Responsável inicia contato                               │
│          ▼                                                          │
│   ┌─────────────┐                                                   │
│   │ EM CONTATO  │ ← Interações em andamento                         │
│   └──────┬──────┘                                                   │
│          │                                                          │
│    ┌─────┴─────┐                                                    │
│    ▼           ▼                                                    │
│ ┌──────────┐ ┌──────────┐                                           │
│ │QUALIFICADA│ │ENCERRADA │ ← Motivo obrigatório                     │
│ └──────────┘ └──────────┘                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Regras de transição:**

| De | Para | Condições | Ações Automáticas |
|----|------|-----------|-------------------|
| — | Pendente | Cadastro válido de empresa PJ | Timestamp criação, notifica fila gerencial |
| Pendente | Atribuída | Gerente designa responsável | Timestamp atribuição, notifica responsável, inicia SLA |
| Atribuída | Em Contato | Primeira interação registrada | Timestamp primeiro contato |
| Em Contato | Qualificada | Responsável confirma fit e interesse | Timestamp qualificação |
| Em Contato | Encerrada | Responsável encerra (motivo obrigatório) | Timestamp encerramento, registra motivo |
| Atribuída | Encerrada | Lead rejeitado sem contato (motivo obrigatório) | Timestamp, motivo |
| Qualificada | Encerrada | Negócio não fechou após qualificação | Timestamp, motivo específico |

**Motivos de encerramento padronizados:**

| Código | Motivo | Categoria |
|--------|--------|-----------|
| NO_BUDGET | Sem capacidade financeira | Fit |
| NO_NEED | Não tem necessidade do serviço | Fit |
| NO_FIT | Fora do perfil (porte, setor, região) | Fit |
| COMPETITOR | Optou por concorrente | Perda |
| TIMING | Momento inadequado (retornar futuro) | Timing |
| NO_RESPONSE | Sem resposta após X tentativas | Engajamento |
| INVALID_DATA | Dados incorretos/empresa inativa | Qualidade |
| DUPLICATE | CNPJ já existente (redirecionado) | Dados |
| OTHER | Outro motivo (campo texto obrigatório) | Outros |

### SLAs e aging — Tempos máximos e alertas

| Métrica | Target | Alerta Amarelo | Alerta Vermelho |
|---------|--------|----------------|-----------------|
| **Pendente → Atribuída** | 4 horas úteis | 2 horas | 4 horas |
| **Atribuída → Primeiro Contato** | 24 horas úteis | 12 horas | 24 horas |
| **Dias sem interação (Em Contato)** | 3 dias úteis | 2 dias | 3 dias |
| **Tempo total até qualificação** | 14 dias | 10 dias | 14 dias |

**Regras de escalação:**

1. Lead pendente > 4h → alerta ao gerente
2. Lead atribuída sem contato > 24h → alerta ao gerente + responsável
3. Lead em contato sem interação > 3 dias → alerta ao responsável
4. Lead em contato > 14 dias → revisão obrigatória pelo gerente

---

## Parte 4: Matriz de Permissões RBAC

### Hierarquia de papéis

```
Admin (acesso total)
    │
    ├── Gerente (gestão de equipe e leads)
    │       │
    │       └── Coordenador (atribuição e acompanhamento)
    │               │
    │               └── Supervisor (visualização de equipe)
    │                       │
    │                       └── Responsável (gestão de leads atribuídos)
    │
    └── Registrador/Parceiro (criação de indicações)
```

### Matriz detalhada de permissões

| Recurso / Ação | Admin | Gerente | Coordenador | Supervisor | Responsável | Registrador |
|----------------|-------|---------|-------------|------------|-------------|-------------|
| **EMPRESAS (PJ)** |
| Criar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Visualizar todas | ✓ | ✓ | ✓ (equipe) | ✓ (equipe) | Próprias | Próprias indicações |
| Editar | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Excluir (soft) | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **CONTATOS** |
| Criar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (na indicação) |
| Editar | ✓ | ✓ | ✓ | ✗ | Próprios | ✗ |
| **INDICAÇÕES/LEADS** |
| Criar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Visualizar todas | ✓ | ✓ | ✓ (equipe) | ✓ (equipe) | Atribuídas | Próprias |
| Atribuir responsável | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Alterar status | ✓ | ✓ | ✓ | ✓ (própria equipe) | Próprias | ✗ |
| Encerrar | ✓ | ✓ | ✓ | ✓ | Próprias | ✗ |
| **INTERAÇÕES** |
| Registrar | ✓ | ✓ | ✓ | ✓ | ✓ (próprios leads) | ✗ |
| Visualizar | ✓ | ✓ | ✓ (equipe) | ✓ (equipe) | Próprios leads | Próprias indicações |
| Editar | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **DASHBOARDS** |
| Visão gerencial | ✓ | ✓ | ✓ | ✓ (limitada) | ✗ | ✗ |
| Visão individual | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Exportar dados | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **CONFIGURAÇÕES** |
| Usuários | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Papéis/permissões | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Motivos encerramento | ✓ | ✓ (visualizar) | ✗ | ✗ | ✗ | ✗ |
| SLAs | ✓ | ✓ (visualizar) | ✗ | ✗ | ✗ | ✗ |
| **AUDITORIA** |
| Visualizar logs | ✓ | ✓ (equipe) | ✗ | ✗ | ✗ | ✗ |
| Exportar auditoria | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## Parte 5: Modelo de Dados (ERD Textual)

### Diagrama de entidades e relacionamentos

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           MODELO DE DADOS LS INDICAÇÃO                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │   USUARIO   │        │   EMPRESA   │        │   CONTATO   │            │
│  │  (users)    │        │ (companies) │        │ (contacts)  │            │
│  ├─────────────┤        ├─────────────┤        ├─────────────┤            │
│  │ id (PK)     │        │ id (PK)     │◄───────│ id (PK)     │            │
│  │ nome        │        │ cnpj (UNQ)  │  1:N   │ empresa_id  │            │
│  │ email (UNQ) │        │ razao_social│        │ nome        │            │
│  │ papel_id    │───────►│ nome_fantasia        │ email       │            │
│  │ equipe_id   │        │ cidade      │        │ telefone    │            │
│  │ ativo       │        │ uf          │        │ whatsapp    │            │
│  │ created_at  │        │ segmento    │        │ cargo       │            │
│  └─────────────┘        │ created_at  │        │ principal   │            │
│         │               │ created_by  │        │ created_at  │            │
│         │               └─────────────┘        └─────────────┘            │
│         │                      │                      │                   │
│         │                      │                      │                   │
│         │               ┌──────┴──────────────────────┘                   │
│         │               │                                                 │
│         │               ▼                                                 │
│         │        ┌─────────────┐                                          │
│         │        │  INDICACAO  │                                          │
│         │        │   (leads)   │                                          │
│         │        ├─────────────┤                                          │
│         │        │ id (PK)     │                                          │
│         │        │ empresa_id  │◄── FK para EMPRESA                       │
│         │        │ contato_id  │◄── FK para CONTATO (principal)           │
│         ├───────►│ registrador_id│◄── FK para USUARIO (quem indicou)      │
│         ├───────►│ responsavel_id│◄── FK para USUARIO (owner atual)       │
│         │        │ status      │                                          │
│         │        │ fonte       │                                          │
│         │        │ necessidade │                                          │
│         │        │ volume_est  │                                          │
│         │        │ urgencia    │                                          │
│         │        │ observacoes │                                          │
│         │        │ motivo_enc  │                                          │
│         │        │ created_at  │                                          │
│         │        │ assigned_at │                                          │
│         │        │ closed_at   │                                          │
│         │        └─────────────┘                                          │
│         │               │                                                 │
│         │               │ 1:N                                             │
│         │               ▼                                                 │
│         │        ┌─────────────┐        ┌─────────────────┐              │
│         │        │ INTERACAO   │        │ STATUS_HISTORY  │              │
│         │        │(interactions)│       │(status_history) │              │
│         │        ├─────────────┤        ├─────────────────┤              │
│         │        │ id (PK)     │        │ id (PK)         │              │
│         └───────►│ lead_id     │        │ lead_id         │◄── da INDICACAO
│                  │ autor_id    │        │ status_anterior │              │
│                  │ tipo        │        │ status_novo     │              │
│                  │ canal       │        │ changed_by      │              │
│                  │ resultado   │        │ changed_at      │              │
│                  │ notas       │        │ motivo          │              │
│                  │ proximo_passo│       └─────────────────┘              │
│                  │ data_hora   │                                         │
│                  │ created_at  │        ┌─────────────────┐              │
│                  └─────────────┘        │   AUDIT_LOG     │              │
│                                         ├─────────────────┤              │
│                                         │ id (PK)         │              │
│                                         │ entity_type     │              │
│                                         │ entity_id       │              │
│                                         │ action          │              │
│                                         │ actor_id        │              │
│                                         │ old_values (JSON)│             │
│                                         │ new_values (JSON)│             │
│                                         │ ip_address      │              │
│                                         │ timestamp       │              │
│                                         └─────────────────┘              │
└────────────────────────────────────────────────────────────────────────────┘
```

### Definições de entidades

#### EMPRESA (companies)
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(14) UNIQUE NOT NULL,  -- sem formatação, apenas números
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cidade VARCHAR(100),
    uf CHAR(2),
    segmento VARCHAR(100),
    porte VARCHAR(50),  -- micro, pequena, media, grande
    website VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ  -- soft delete
);

CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_uf ON companies(uf);
CREATE INDEX idx_companies_segmento ON companies(segmento);
```

#### CONTATO (contacts)
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES companies(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    cargo VARCHAR(100),
    principal BOOLEAN DEFAULT FALSE,
    base_legal VARCHAR(50) NOT NULL DEFAULT 'legitimate_interest',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    anonymized_at TIMESTAMPTZ
);

CREATE INDEX idx_contacts_empresa ON contacts(empresa_id);
CREATE INDEX idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
```

#### INDICAÇÃO (leads)
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES companies(id),
    contato_id UUID REFERENCES contacts(id),
    registrador_id UUID NOT NULL REFERENCES users(id),
    responsavel_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    fonte VARCHAR(100),
    necessidade VARCHAR(100),
    categoria_servico VARCHAR(100),
    volume_estimado VARCHAR(50),  -- faixas: ate_50k, 50k_200k, 200k_500k, acima_500k
    urgencia VARCHAR(20),  -- baixa, media, alta
    observacoes TEXT,
    motivo_encerramento VARCHAR(100),
    detalhe_encerramento TEXT,
    lead_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    first_contact_at TIMESTAMPTZ,
    qualified_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    CONSTRAINT chk_status CHECK (status IN ('pendente', 'atribuida', 'em_contato', 'qualificada', 'encerrada'))
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_responsavel ON leads(responsavel_id);
CREATE INDEX idx_leads_registrador ON leads(registrador_id);
CREATE INDEX idx_leads_empresa ON leads(empresa_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
```

#### INTERAÇÃO (interactions)
```sql
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    autor_id UUID NOT NULL REFERENCES users(id),
    tipo VARCHAR(50) NOT NULL,  -- ligacao, whatsapp, email, reuniao, nota
    canal VARCHAR(50),  -- telefone, whatsapp, email, presencial, video
    direcao VARCHAR(20),  -- inbound, outbound
    resultado VARCHAR(100),  -- conectado, sem_resposta, caixa_postal, ocupado, agendado
    notas TEXT,
    proximo_passo TEXT,
    data_proxima_acao DATE,
    duracao_minutos INTEGER,
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interactions_lead ON interactions(lead_id);
CREATE INDEX idx_interactions_autor ON interactions(autor_id);
CREATE INDEX idx_interactions_data ON interactions(data_hora DESC);
```

#### HISTÓRICO DE STATUS (status_history)
```sql
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id),
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    motivo VARCHAR(255)
);

CREATE INDEX idx_status_history_lead ON status_history(lead_id);
```

#### LOG DE AUDITORIA (audit_log)
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,  -- CREATE, UPDATE, DELETE, READ
    actor_id UUID REFERENCES users(id),
    actor_type VARCHAR(50) DEFAULT 'user',
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    previous_hash VARCHAR(64),
    entry_hash VARCHAR(64)
);

-- Auditoria append-only: revogar UPDATE/DELETE do role da aplicação
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
```

---

## Parte 6: Backlog Priorizado

### Épicos MVP (Fase 1)

#### Épico 1: Cadastro de Empresas e Deduplicação
**Objetivo:** Permitir registro de empresas PJ com unicidade garantida por CNPJ.

| User Story | Critérios de Aceite | Prioridade |
|------------|---------------------|------------|
| **US1.1** Como registrador, quero cadastrar uma empresa indicada informando CNPJ | - Campo CNPJ com máscara XX.XXX.XXX/XXXX-XX<br>- Validação de dígitos verificadores (Modulo 11)<br>- Verificação de duplicata em tempo real<br>- Se duplicado: bloqueia e mostra link para registro existente | P0 |
| **US1.2** Como registrador, quero informar dados mínimos do contato principal | - Campos: nome contato (obrigatório), telefone/WhatsApp (obrigatório), email (opcional)<br>- Validação de formato telefone brasileiro<br>- Checkbox de consentimento LGPD | P0 |
| **US1.3** Como registrador, quero receber confirmação visual após cadastro | - Tela de sucesso com número da indicação<br>- Opção de cadastrar nova indicação<br>- Link para visualizar indicação criada | P0 |

#### Épico 2: Fila de Pendentes e Atribuição
**Objetivo:** Permitir que gerentes visualizem e atribuam leads pendentes.

| User Story | Critérios de Aceite | Prioridade |
|------------|---------------------|------------|
| **US2.1** Como gerente, quero ver fila de leads pendentes ordenados por antiguidade | - Lista com: empresa, contato, data criação, tempo pendente<br>- Ordenação padrão: mais antigo primeiro<br>- Filtros: data, fonte, registrador<br>- Indicador visual de aging (verde/amarelo/vermelho) | P0 |
| **US2.2** Como gerente, quero atribuir um lead a um responsável | - Dropdown com usuários elegíveis (papel Responsável ou superior)<br>- Confirmação antes de atribuir<br>- Status muda automaticamente para "Atribuída"<br>- Timestamp de atribuição registrado<br>- Notificação enviada ao responsável | P0 |
| **US2.3** Como responsável, quero ser notificado quando recebo um lead | - Notificação in-app (badge/toast)<br>- Email com dados resumidos do lead<br>- Link direto para abrir o lead | P1 |

#### Épico 3: Gestão de Status e Timeline
**Objetivo:** Permitir progressão de leads pelo funil com registro de interações.

| User Story | Critérios de Aceite | Prioridade |
|------------|---------------------|------------|
| **US3.1** Como responsável, quero registrar uma interação com o lead | - Tipos: Ligação, WhatsApp, Email, Reunião, Nota<br>- Campos: tipo, resultado, notas, próximo passo, data próxima ação<br>- Se primeira interação: status muda para "Em Contato"<br>- Timestamp automático | P0 |
| **US3.2** Como responsável, quero visualizar a timeline de interações do lead | - Lista cronológica inversa (mais recente primeiro)<br>- Cada item mostra: tipo, data/hora, autor, resultado, notas<br>- Ícones visuais por tipo de interação | P0 |
| **US3.3** Como responsável, quero marcar um lead como Qualificado | - Botão de ação "Qualificar"<br>- Status muda para "Qualificada"<br>- Timestamp de qualificação registrado<br>- Histórico de mudança gravado | P0 |
| **US3.4** Como responsável, quero encerrar um lead com motivo | - Botão de ação "Encerrar"<br>- Modal com dropdown de motivos padronizados<br>- Campo de detalhes obrigatório se motivo = "Outro"<br>- Status muda para "Encerrada"<br>- Não permite reabrir (imutável) | P0 |

#### Épico 4: Dashboards Essenciais
**Objetivo:** Fornecer visibilidade de performance e filas.

| User Story | Critérios de Aceite | Prioridade |
|------------|---------------------|------------|
| **US4.1** Como gerente, quero ver painel com visão geral da operação | - Cards: leads criados (período), pendentes, em SLA, fora de SLA<br>- Funil visual por status<br>- Lista de leads com aging crítico | P0 |
| **US4.2** Como responsável, quero ver minha carteira de leads | - Lista: meus leads atribuídos por status<br>- Indicador de próxima ação vencida<br>- Contador de dias desde última interação | P0 |
| **US4.3** Como registrador, quero ver minhas indicações | - Lista de indicações que criei<br>- Status atual de cada uma<br>- Sem acesso a detalhes de interações | P1 |

#### Épico 5: Autenticação e Auditoria Básica
**Objetivo:** Segurança mínima e rastreabilidade.

| User Story | Critérios de Aceite | Prioridade |
|------------|---------------------|------------|
| **US5.1** Como usuário, quero fazer login com email e senha | - Formulário de login com validação<br>- Hash seguro de senhas (bcrypt/Argon2)<br>- Sessão com timeout de 8 horas<br>- Bloqueio após 5 tentativas falhas | P0 |
| **US5.2** Como admin, quero que todas as ações sejam registradas | - Log de criação, edição, deleção de registros<br>- Log de mudanças de status<br>- Log de login/logout<br>- Campos: quem, o quê, quando, de onde (IP) | P0 |

### Épicos Fase 2 (Escala e Governança)

| Épico | User Stories Principais |
|-------|------------------------|
| **E6: SLAs e Alertas** | Configuração de SLAs por status, alertas automáticos, escalação |
| **E7: Permissões Refinadas** | Hierarquia de equipes, visibilidade por território, delegação |
| **E8: Relatórios Avançados** | Relatórios de conversão, performance por fonte, exportação |
| **E9: Importação CSV** | Upload em lote de empresas e contatos com validação |
| **E10: MFA** | Autenticação multi-fator para papéis críticos |

### Épicos Fase 3 (Automação)

| Épico | User Stories Principais |
|-------|------------------------|
| **E11: WhatsApp Templates** | Integração com WhatsApp Business API, templates aprovados |
| **E12: Webhooks** | Eventos de lead para sistemas externos (lead.created, status.changed) |
| **E13: Lead Scoring** | Score automático baseado em completude e perfil |
| **E14: Roteamento Inteligente** | Distribuição automática por regras (região, segmento, carga) |
| **E15: Integração CRM** | Sincronização bidirecional com CRMs existentes |

---

## Parte 7: Especificação de Dashboards e KPIs

### KPIs essenciais — Definições e fórmulas

| KPI | Definição | Fórmula | Meta Sugerida |
|-----|-----------|---------|---------------|
| **Leads Criados** | Total de indicações no período | COUNT(leads) WHERE created_at IN período | Baseline + 10% |
| **Tempo até Atribuição** | Horas entre criação e designação de responsável | AVG(assigned_at - created_at) | < 4 horas |
| **Tempo até 1º Contato** | Horas entre atribuição e primeira interação | AVG(first_contact_at - assigned_at) | < 24 horas |
| **Taxa de Conversão por Etapa** | % de leads que avançam entre status | COUNT(status_novo) / COUNT(status_anterior) × 100 | Pendente→Atribuída: 95%<br>Atribuída→Em Contato: 90%<br>Em Contato→Qualificada: 30% |
| **Aging por Status** | Dias médios em cada status | AVG(CURRENT_DATE - status_entry_date) por status | Pendente: < 0.5 dias<br>Atribuída: < 1 dia<br>Em Contato: < 7 dias |
| **Taxa de Encerramento por Motivo** | Distribuição de motivos de encerramento | COUNT(motivo) / COUNT(encerrados) × 100 | Monitorar tendências |
| **Performance por Responsável** | Conversão individual vs média | (conversões / leads atribuídos) × 100 por responsável | > média da equipe |
| **Performance por Fonte** | Qualidade das indicações por origem | (qualificados / criados por fonte) × 100 | Identificar melhores fontes |
| **SLA Compliance** | % de leads dentro do SLA | COUNT(dentro_sla) / COUNT(total) × 100 | > 90% |
| **Lead Score Médio** | Qualidade média dos leads | AVG(lead_score) | > 60 pontos |

### Dashboard Gerencial — Especificação

**Seção 1: Resumo Executivo (Topo)**
- 4 cards KPI: Leads Criados (período), Pendentes (fila), Em SLA (%), Conversão (%)
- Comparativo vs período anterior com seta de tendência

**Seção 2: Funil Visual (Centro-Esquerda)**
- Funil horizontal com 5 estágios
- Números absolutos e % de conversão entre estágios
- Click-through para lista de leads em cada estágio

**Seção 3: Performance da Equipe (Centro-Direita)**
- Tabela: Responsável, Atribuídos, Contatados, Qualificados, Taxa, Tempo Médio
- Ordenável por qualquer coluna
- Drill-down para carteira individual

**Seção 4: Alertas e Aging (Inferior)**
- Lista de leads com aging crítico (vermelho)
- Contagem de leads pendentes > 4h
- Botões de ação rápida (atribuir, ver detalhes)

**Filtros Disponíveis:** Período, Equipe/Território, Fonte, Responsável

### Dashboard do Responsável — Especificação

**Seção 1: Minha Performance (Topo)**
- Cards: Meus leads hoje, Esta semana, Taxa conversão, Tempo médio resposta
- Comparativo vs média da equipe

**Seção 2: Minha Fila de Trabalho (Principal)**
- Lista priorizada de leads atribuídos
- Colunas: Empresa, Contato, Status, Dias no status, Próxima ação, Score
- Código de cores por urgência
- Ações rápidas: Ligar, WhatsApp, Registrar interação

**Seção 3: Atividades Recentes (Lateral)**
- Timeline das últimas 10 interações registradas
- Lembretes de próximas ações

**Seção 4: Meu Pipeline (Inferior)**
- Mini-funil pessoal com leads por status
- Leads com próxima ação vencida destacados

### Dashboard do Registrador — Especificação

**Seção 1: Minhas Indicações (Principal)**
- Lista de indicações criadas pelo usuário
- Colunas: Empresa, Data indicação, Status atual, Responsável
- Sem acesso a detalhes de interações

**Seção 2: Resumo (Lateral)**
- Total de indicações (mês/ano)
- Distribuição por status atual
- Taxa de qualificação das minhas indicações

---

## Parte 8: Arquitetura e Checklists

### Arquitetura recomendada

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARQUITETURA LS INDICAÇÃO                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   Web App       │    │   Mobile App    │    │   Admin Panel   │ │
│  │   (React/Vue)   │    │ (React Native)  │    │   (React)       │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘ │
│           │                      │                      │          │
│           └──────────────────────┼──────────────────────┘          │
│                                  │                                 │
│                         ┌────────▼────────┐                        │
│                         │   API Gateway   │                        │
│                         │ (Rate Limiting, │                        │
│                         │  Auth, Logging) │                        │
│                         └────────┬────────┘                        │
│                                  │                                 │
│                         ┌────────▼────────┐                        │
│                         │    REST API     │                        │
│                         │ (Node/FastAPI)  │                        │
│                         │   OpenAPI 3.0   │                        │
│                         └────────┬────────┘                        │
│                                  │                                 │
│              ┌───────────────────┼───────────────────┐             │
│              │                   │                   │             │
│     ┌────────▼────────┐ ┌───────▼───────┐ ┌────────▼────────┐    │
│     │   PostgreSQL    │ │     Redis     │ │   File Storage  │    │
│     │   (Primary DB)  │ │   (Cache/     │ │   (S3/Minio)    │    │
│     │   + Audit Log   │ │    Sessions)  │ │                 │    │
│     └─────────────────┘ └───────────────┘ └─────────────────┘    │
│                                                                     │
│  Infraestrutura: AWS São Paulo (sa-east-1) ou Azure Brazil South   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Stack recomendado:**
- **Frontend:** React ou Vue.js com TypeScript
- **Mobile:** React Native ou PWA (Progressive Web App)
- **Backend:** Node.js (NestJS) ou Python (FastAPI)
- **Banco:** PostgreSQL 15+ (com extensão para audit)
- **Cache:** Redis para sessões e rate limiting
- **Infraestrutura:** AWS sa-east-1 (Brasil) para compliance LGPD

### Checklist de segurança (OWASP ASVS Nível 2)

#### Autenticação
- [ ] Senhas com mínimo 8 caracteres, verificação contra listas de senhas vazadas
- [ ] Hash com bcrypt ou Argon2 (cost factor ≥ 10)
- [ ] MFA disponível para papéis administrativos (Fase 2)
- [ ] Sessões com timeout absoluto (8h) e idle (30min)
- [ ] Regeneração de session ID após login
- [ ] Bloqueio após 5 tentativas falhas (15 minutos)

#### Autorização
- [ ] RBAC enforced server-side em todas as rotas
- [ ] Verificação de object-level authorization (user pode acessar este lead específico?)
- [ ] Deny by default — acesso requer permissão explícita
- [ ] Validação de workflow state (não pular etapas de status)

#### Validação de Entrada
- [ ] Validação server-side de todos os inputs (client-side é apenas UX)
- [ ] CNPJ: validação de dígitos verificadores + máscara + unique constraint
- [ ] Telefone: normalização para formato E.164 brasileiro (+5511912345678)
- [ ] Email: validação de formato + domínio (se informado)
- [ ] Queries parametrizadas (sem concatenação de strings SQL)
- [ ] Output encoding para prevenção de XSS

#### Rate Limiting
- [ ] Login: 5 req/min por IP
- [ ] API geral: 100 req/min por usuário
- [ ] Busca/pesquisa: 30 req/min por usuário
- [ ] Export: 5 req/hora por usuário
- [ ] HTTP 429 com header Retry-After

#### Auditoria
- [ ] Log de todos os eventos de autenticação
- [ ] Log de todas as operações CRUD em entidades sensíveis
- [ ] Log de mudanças de status com valores anterior/novo
- [ ] Log imutável (append-only, sem UPDATE/DELETE)
- [ ] Retenção mínima de 2 anos

#### Headers de Segurança
- [ ] HTTPS obrigatório (TLS 1.2+)
- [ ] Strict-Transport-Security: max-age=31536000; includeSubDomains
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Content-Security-Policy configurado
- [ ] CORS restrito a origens permitidas

### Checklist LGPD

#### Base Legal e Consentimento
- [ ] Base legal definida para processamento (legítimo interesse para B2B)
- [ ] Registro de consentimento quando aplicável (WhatsApp marketing)
- [ ] Mecanismo de retirada de consentimento tão fácil quanto dar
- [ ] Política de privacidade em português acessível

#### Minimização de Dados
- [ ] Coletar apenas dados necessários para a finalidade
- [ ] Documentar finalidade de cada campo coletado
- [ ] Revisar campos trimestralmente

#### Direitos dos Titulares
- [ ] Endpoint/processo para confirmação de processamento
- [ ] Endpoint/processo para acesso aos dados pessoais
- [ ] Endpoint/processo para correção de dados
- [ ] Endpoint/processo para exclusão/anonimização
- [ ] Endpoint/processo para portabilidade (CSV/JSON)
- [ ] Prazo de resposta: 15 dias

#### Retenção e Descarte
- [ ] Política de retenção documentada por tipo de dado
- [ ] Leads não convertidos: 12-24 meses, depois anonimizar
- [ ] Clientes: duração do relacionamento + 5 anos (obrigação fiscal)
- [ ] Logs de auditoria: 5 anos mínimo
- [ ] Processo de hard delete/anonimização após TTL

#### Segurança e Incidentes
- [ ] DPO nomeado com contato publicado
- [ ] Registro de atividades de tratamento documentado
- [ ] Processo de notificação de incidentes (72h recomendado para ANPD)
- [ ] Contratos de processamento de dados com terceiros

### Design de integração futura

#### Eventos de domínio (para webhooks)

```json
{
  "event_id": "uuid",
  "event_type": "lead.created | lead.assigned | lead.status_changed | interaction.created",
  "timestamp": "2025-02-03T10:30:00Z",
  "version": "1.0",
  "actor": {
    "type": "user",
    "id": "uuid"
  },
  "data": {
    "lead_id": "uuid",
    "empresa_id": "uuid",
    "cnpj": "12345678000199",
    "status": "atribuida",
    "previous_status": "pendente",
    "responsavel_id": "uuid"
  },
  "metadata": {
    "correlation_id": "uuid",
    "source": "api"
  }
}
```

#### Webhook delivery
- Assinatura HMAC-SHA256 no header X-Signature
- Retry exponencial: 1s, 5s, 30s, 2min, 10min
- Dead letter queue após 5 tentativas
- Log de todas as entregas para debugging

#### Exportação CSV
- Campos: lead_id, cnpj, empresa, contato, email, telefone, status, created_at
- Auditoria obrigatória de todas as exportações
- Rate limit: 5 exports/hora
- Links de download com expiração em 24h

---

## Parte 9: Lead Quality Score — Modelo Proposto

### Componentes do score (0-100 pontos)

#### Score de Completude (0-40 pontos)
| Campo | Pontos | Lógica |
|-------|--------|--------|
| CNPJ válido | +10 | Base obrigatória |
| Nome da empresa | +5 | Obrigatório |
| Nome do contato | +5 | Obrigatório |
| Telefone/WhatsApp | +5 | Obrigatório |
| Email | +5 | Opcional, mas valorizado |
| Cidade/UF | +3 | Enriquecimento |
| Segmento/Atividade | +4 | Enriquecimento |
| Necessidade específica | +3 | Contexto comercial |

#### Score de Fit (0-40 pontos)
| Critério | Pontos | Lógica |
|----------|--------|--------|
| Segmento-alvo | +15 | Indústria, Comércio, Serviços, Agro |
| UF primária | +10 | MG, SP, RJ, outros Sudeste/CO |
| Porte adequado | +10 | Pequena/Média empresa |
| Necessidade alinhada | +5 | Antecipação, Capital de giro |

#### Score de Engajamento (0-20 pontos)
| Ação | Pontos | Decay |
|------|--------|-------|
| Indicação de parceiro confiável | +10 | Permanente |
| Urgência alta declarada | +5 | 7 dias |
| Interação positiva | +5 | Por interação conectada |

### Fórmula final
```
LEAD_SCORE = Score_Completude + Score_Fit + Score_Engajamento
```

### Thresholds de priorização
| Score | Classificação | Ação |
|-------|---------------|------|
| 80-100 | Hot (A) | Contato imediato (< 4h) |
| 60-79 | Warm (B) | Contato prioritário (< 24h) |
| 40-59 | Neutral (C) | Contato padrão |
| 0-39 | Cold (D) | Verificar qualidade/dados |

---

## Parte 10: Roadmap de Implementação

### Fase 1 — MVP (8-12 semanas)

**Semanas 1-2: Setup e Infraestrutura**
- Configuração de ambiente (dev, staging)
- Setup de banco de dados e migrations
- Autenticação básica (email/senha)

**Semanas 3-5: Core Features**
- Cadastro de empresas com validação CNPJ
- Deduplicação em tempo real
- CRUD de contatos

**Semanas 6-8: Fluxo de Leads**
- Criação de indicações
- Fila de pendentes
- Atribuição de responsáveis
- Transições de status

**Semanas 9-10: Timeline e Interações**
- Registro de interações
- Timeline visual
- Encerramento com motivos

**Semanas 11-12: Dashboards e Polish**
- Dashboard gerencial básico
- Dashboard do responsável
- Testes e correções

### Fase 2 — Escala (6-8 semanas)
- SLAs configuráveis e alertas
- Permissões granulares por equipe
- Relatórios avançados e exportação
- MFA para admins

### Fase 3 — Automação (8-10 semanas)
- Integração WhatsApp Business API
- Sistema de webhooks
- Lead scoring automático
- Roteamento inteligente

---

## Conclusão

Este documento estabelece as bases para construção do LS Indicação como um sistema robusto, seguro e escalável de gestão de indicações B2B. As decisões de design priorizam:

**Simplicidade no MVP** com apenas 5 status e campos mínimos obrigatórios, permitindo adoção rápida pela equipe. O modelo de dados suporta evolução futura sem retrabalho estrutural.

**Compliance desde o início** com LGPD implementado por design (base legal definida, minimização de dados, direitos dos titulares) e segurança alinhada a OWASP ASVS Nível 2.

**Preparação para escala** através de arquitetura API-first, eventos de domínio documentados, e backlog estruturado em fases progressivas.

O sistema diferencia-se de CRMs genéricos ao focar especificamente no fluxo de indicação → qualificação típico de factoring, com campos de qualificação relevantes ao setor (volume de recebíveis, urgência, segmento) e integração futura com WhatsApp Business API — canal dominante no Brasil para comunicação B2B.

A próxima etapa recomendada é validação deste PRD com stakeholders de negócio, seguida de prototipação das telas principais para validação de UX antes do desenvolvimento.