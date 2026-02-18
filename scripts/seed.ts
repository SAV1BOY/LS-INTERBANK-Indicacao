import { PrismaClient, UserRole, LeadStatus, Urgency, CompanySize, InteractionType, InteractionResult } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Create users
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const testPasswordHash = await bcrypt.hash("johndoe123", 12);
  const userPasswordHash = await bcrypt.hash("gerente123", 12);
  const aliadoPasswordHash = await bcrypt.hash("aliado123", 12);

  // Admin user principal
  const admin = await prisma.user.upsert({
    where: { email: "admin@lsinterbank.com.br" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@lsinterbank.com.br",
      name: "Administrador",
      passwordHash: adminPasswordHash,
      role: "ADMIN" as UserRole,
    },
  });
  console.log("✅ Admin criado: admin@lsinterbank.com.br / admin123");

  // Test user (required - hidden)
  const testUser = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      name: "John Doe",
      passwordHash: testPasswordHash,
      role: "ADMIN" as UserRole,
    },
  });

  // Gerente principal
  const gerente1 = await prisma.user.upsert({
    where: { email: "gerente@lsinterbank.com.br" },
    update: { passwordHash: userPasswordHash },
    create: {
      email: "gerente@lsinterbank.com.br",
      name: "Gerente Principal",
      passwordHash: userPasswordHash,
      role: "GERENTE" as UserRole,
    },
  });
  console.log("✅ Gerente criado: gerente@lsinterbank.com.br / gerente123");

  const gerente2 = await prisma.user.upsert({
    where: { email: "maria.santos@lsinterbank.com.br" },
    update: { role: "GERENTE" as UserRole, passwordHash: userPasswordHash },
    create: {
      email: "maria.santos@lsinterbank.com.br",
      name: "Maria Santos",
      passwordHash: userPasswordHash,
      role: "GERENTE" as UserRole,
    },
  });
  console.log("✅ Gerente adicional criado: maria.santos@lsinterbank.com.br");

  const gerente3 = await prisma.user.upsert({
    where: { email: "carlos.mendes@lsinterbank.com.br" },
    update: { role: "GERENTE" as UserRole, passwordHash: userPasswordHash },
    create: {
      email: "carlos.mendes@lsinterbank.com.br",
      name: "Carlos Mendes",
      passwordHash: userPasswordHash,
      role: "GERENTE" as UserRole,
    },
  });

  const gerente4 = await prisma.user.upsert({
    where: { email: "ana.costa@lsinterbank.com.br" },
    update: { role: "GERENTE" as UserRole, passwordHash: userPasswordHash },
    create: {
      email: "ana.costa@lsinterbank.com.br",
      name: "Ana Costa",
      passwordHash: userPasswordHash,
      role: "GERENTE" as UserRole,
    },
  });

  const gerente5 = await prisma.user.upsert({
    where: { email: "pedro.lima@lsinterbank.com.br" },
    update: { role: "GERENTE" as UserRole, passwordHash: userPasswordHash },
    create: {
      email: "pedro.lima@lsinterbank.com.br",
      name: "Pedro Lima",
      passwordHash: userPasswordHash,
      role: "GERENTE" as UserRole,
    },
  });
  console.log("✅ Gerentes adicionais criados");

  // Aliado principal
  const aliado1 = await prisma.user.upsert({
    where: { email: "aliado@lsinterbank.com.br" },
    update: { passwordHash: aliadoPasswordHash },
    create: {
      email: "aliado@lsinterbank.com.br",
      name: "Aliado Principal",
      passwordHash: aliadoPasswordHash,
      role: "ALIADO" as UserRole,
    },
  });
  console.log("✅ Aliado criado: aliado@lsinterbank.com.br / aliado123");

  const aliado2 = await prisma.user.upsert({
    where: { email: "joao.parceiro@email.com" },
    update: { role: "ALIADO" as UserRole, passwordHash: aliadoPasswordHash },
    create: {
      email: "joao.parceiro@email.com",
      name: "João Parceiro",
      passwordHash: aliadoPasswordHash,
      role: "ALIADO" as UserRole,
    },
  });

  const aliado3 = await prisma.user.upsert({
    where: { email: "fernanda.contadora@email.com" },
    update: { role: "ALIADO" as UserRole, passwordHash: aliadoPasswordHash },
    create: {
      email: "fernanda.contadora@email.com",
      name: "Fernanda Contadora",
      passwordHash: aliadoPasswordHash,
      role: "ALIADO" as UserRole,
    },
  });
  console.log("✅ Aliados adicionais criados");

  // Create products
  const products = [
    { name: "Antecipação de Recebíveis", description: "Transformação de vendas a prazo em capital imediato" },
    { name: "Antecipação de Contratos", description: "Desconto especializado para empresas com pagamento via crédito em conta" },
    { name: "Cobrança Simples", description: "Terceirização de gestão de recebíveis" },
    { name: "Gestão de Riscos", description: "Consultoria para avaliação de risco de carteira" },
    { name: "Operação Cadeia Produtiva", description: "Financiamento via parcerias com empresas-âncora" },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/ /g, "-") },
      update: {},
      create: {
        id: product.name.toLowerCase().replace(/ /g, "-"),
        name: product.name,
        description: product.description,
      },
    });
  }
  console.log("✅ Produtos criados");

  // Create sample companies and leads
  const companies = [
    {
      cnpj: "12345678000190",
      razaoSocial: "ABC Indústria e Comércio Ltda",
      nomeFantasia: "ABC Indústria",
      city: "Belo Horizonte",
      state: "MG",
      segment: "industria",
      size: "PEQUENA" as CompanySize,
      contact: {
        name: "João da Silva",
        email: "joao@abcindustria.com.br",
        phone: "31999999999",
        position: "Diretor Financeiro",
      },
      lead: {
        status: "EM_CONTATO" as LeadStatus,
        necessity: "antecipacao_recebiveis",
        urgency: "ALTA" as Urgency,
        source: "Indicação de cliente",
        notes: "Empresa em expansão, abriu nova filial",
        leadScore: 75,
        registrador: aliado1.id,
        responsavel: gerente1.id,
      },
    },
    {
      cnpj: "98765432000111",
      razaoSocial: "XYZ Comércio Varejista Ltda",
      nomeFantasia: "Loja XYZ",
      city: "Contagem",
      state: "MG",
      segment: "comercio",
      size: "PEQUENA" as CompanySize,
      contact: {
        name: "Maria Santos",
        email: "maria@lojaxyz.com.br",
        phone: "31988888888",
        position: "Gerente Comercial",
      },
      lead: {
        status: "ATRIBUIDA" as LeadStatus,
        necessity: "capital_giro",
        urgency: "MEDIA" as Urgency,
        source: "Evento LS Interbank",
        leadScore: 60,
        registrador: aliado2.id,
        responsavel: gerente1.id,
      },
    },
    {
      cnpj: "11223344000155",
      razaoSocial: "Tech Solutions Tecnologia Ltda",
      nomeFantasia: "Tech Solutions",
      city: "Belo Horizonte",
      state: "MG",
      segment: "tecnologia",
      size: "MEDIA" as CompanySize,
      contact: {
        name: "Pedro Lima",
        email: "pedro@techsolutions.com.br",
        phone: "31977777777",
        position: "CEO",
      },
      lead: {
        status: "PENDENTE" as LeadStatus,
        necessity: "antecipacao_contratos",
        urgency: "IMEDIATA" as Urgency,
        source: "Site institucional",
        leadScore: 85,
        registrador: aliado1.id,
        responsavel: null,
      },
    },
    {
      cnpj: "55667788000122",
      razaoSocial: "Agro Campo Verde Ltda",
      nomeFantasia: "Campo Verde",
      city: "Uberlândia",
      state: "MG",
      segment: "agronegocio",
      size: "MEDIA" as CompanySize,
      contact: {
        name: "Roberto Campos",
        email: "roberto@campoverde.agr.br",
        phone: "34966666666",
        position: "Diretor",
      },
      lead: {
        status: "QUALIFICADA" as LeadStatus,
        necessity: "cadeia_produtiva",
        urgency: "ALTA" as Urgency,
        source: "Indicação parceiro",
        leadScore: 90,
        registrador: aliado1.id,
        responsavel: gerente1.id,
      },
    },
    {
      cnpj: "99887766000133",
      razaoSocial: "Serviços Rápidos Ltda",
      nomeFantasia: "ServiRápido",
      city: "Betim",
      state: "MG",
      segment: "servicos",
      size: "MICRO" as CompanySize,
      contact: {
        name: "Carla Alves",
        email: "carla@servirapido.com.br",
        phone: "31955555555",
        position: "Sócia",
      },
      lead: {
        status: "PENDENTE" as LeadStatus,
        necessity: "cobranca_simples",
        urgency: "BAIXA" as Urgency,
        source: "LinkedIn",
        leadScore: 45,
        registrador: aliado2.id,
        responsavel: null,
      },
    },
  ];

  for (const companyData of companies) {
    // Check if company exists
    let company = await prisma.company.findUnique({
      where: { cnpj: companyData.cnpj },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          cnpj: companyData.cnpj,
          razaoSocial: companyData.razaoSocial,
          nomeFantasia: companyData.nomeFantasia,
          city: companyData.city,
          state: companyData.state,
          segment: companyData.segment,
          size: companyData.size,
          consentimento: true,
          createdById: companyData.lead.registrador,
        },
      });
    }

    // Check if contact exists
    let contact = await prisma.contact.findFirst({
      where: { companyId: company.id },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          companyId: company.id,
          name: companyData.contact.name,
          email: companyData.contact.email,
          phone: companyData.contact.phone,
          whatsapp: companyData.contact.phone,
          position: companyData.contact.position,
          isPrimary: true,
          consentimento: true,
        },
      });
    }

    // Check if lead exists for this company
    const existingLead = await prisma.lead.findFirst({
      where: { companyId: company.id },
    });

    if (!existingLead) {
      const lead = await prisma.lead.create({
        data: {
          companyId: company.id,
          contactId: contact.id,
          registradorId: companyData.lead.registrador,
          responsavelId: companyData.lead.responsavel,
          status: companyData.lead.status,
          necessity: companyData.lead.necessity,
          urgency: companyData.lead.urgency,
          source: companyData.lead.source,
          notes: companyData.lead.notes,
          leadScore: companyData.lead.leadScore,
          assignedAt: companyData.lead.responsavel ? new Date() : null,
          firstContactAt: companyData.lead.status === "EM_CONTATO" || companyData.lead.status === "QUALIFICADA" ? new Date() : null,
          qualifiedAt: companyData.lead.status === "QUALIFICADA" ? new Date() : null,
        },
      });

      // Create status history
      await prisma.statusHistory.create({
        data: {
          leadId: lead.id,
          newStatus: "PENDENTE",
          changedById: companyData.lead.registrador,
          reason: "Lead criado",
        },
      });

      if (companyData.lead.responsavel) {
        await prisma.statusHistory.create({
          data: {
            leadId: lead.id,
            previousStatus: "PENDENTE",
            newStatus: "ATRIBUIDA",
            changedById: admin.id,
            reason: "Lead atribuído",
          },
        });

        await prisma.assignment.create({
          data: {
            leadId: lead.id,
            assignedToId: companyData.lead.responsavel,
            assignedById: admin.id,
          },
        });
      }

      // Add interactions for leads with contact
      if (companyData.lead.status === "EM_CONTATO" || companyData.lead.status === "QUALIFICADA") {
        await prisma.interaction.create({
          data: {
            leadId: lead.id,
            authorId: companyData.lead.responsavel!,
            type: "LIGACAO" as InteractionType,
            result: "CONTATO_SUCESSO" as InteractionResult,
            notes: "Primeiro contato realizado. Cliente demonstrou interesse.",
            nextStep: "Enviar proposta comercial",
            nextStepDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        });

        if (companyData.lead.status === "EM_CONTATO") {
          await prisma.statusHistory.create({
            data: {
              leadId: lead.id,
              previousStatus: "ATRIBUIDA",
              newStatus: "EM_CONTATO",
              changedById: companyData.lead.responsavel!,
              reason: "Primeiro contato registrado",
            },
          });
        }
      }

      if (companyData.lead.status === "QUALIFICADA") {
        await prisma.interaction.create({
          data: {
            leadId: lead.id,
            authorId: companyData.lead.responsavel!,
            type: "REUNIAO" as InteractionType,
            result: "CONTATO_SUCESSO" as InteractionResult,
            notes: "Reunião realizada com sucesso. Cliente qualificado para proposta.",
            durationMinutes: 45,
          },
        });

        await prisma.statusHistory.create({
          data: {
            leadId: lead.id,
            previousStatus: "EM_CONTATO",
            newStatus: "QUALIFICADA",
            changedById: companyData.lead.responsavel!,
            reason: "Cliente qualificado após reunião",
          },
        });
      }
    }
  }

  console.log("✅ Empresas e leads criados");
  console.log("");
  console.log("🎉 Seed concluído com sucesso!");
  console.log("");
  console.log("🔑 Credenciais de acesso:");
  console.log("   Admin: admin@lsinterbank.com.br / admin123");
  console.log("   Gerente: gerente@lsinterbank.com.br / gerente123");
  console.log("   Aliado: aliado@lsinterbank.com.br / aliado123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
