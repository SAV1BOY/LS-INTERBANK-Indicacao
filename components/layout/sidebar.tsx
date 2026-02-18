"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  PlusCircle,
  List,
  BarChart3,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  permission: string;
  hideForRoles?: string[];
};

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard:personal",
  },
  {
    name: "Nova Indicação",
    href: "/leads/new",
    icon: PlusCircle,
    permission: "lead:create",
    hideForRoles: ["GERENTE"], // Gerente não cria indicação, cria prospecção
  },
  {
    name: "Leads",
    href: "/leads",
    icon: List,
    permission: "lead:read:own",
  },
  {
    name: "Empresas",
    href: "/empresas",
    icon: Building2,
    permission: "company:read",
    // Aliado não vê Empresas (company:read não inclui ALIADO)
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    permission: "report:view",
  },
  {
    name: "Usuários",
    href: "/usuarios",
    icon: Users,
    permission: "user:read",
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permission: "config:read",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession() ?? {};
  const userRole = (session?.user as any)?.role ?? "ALIADO";

  const filteredNavigation = navigation.filter((item) => {
    // Verifica permissão
    if (!hasPermission(userRole, item.permission as any)) return false;
    // Verifica se deve esconder para este papel
    if (item.hideForRoles?.includes(userRole)) return false;
    return true;
  });

  return (
    <div className="flex h-full w-64 flex-col bg-[#1e3a5f]">
      <div className="flex h-20 items-center justify-center border-b border-[#2a4a73] px-4">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative w-40 h-14">
            <Image
              src="/logo-ls-interbank.png"
              alt="LS Interbank"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#2a4a73] p-4">
        <div className="text-xs text-gray-400">
          © 2026 LS Interbank
        </div>
      </div>
    </div>
  );
}
