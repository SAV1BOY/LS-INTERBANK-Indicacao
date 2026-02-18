import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { UserRole } from "@prisma/client";

export type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
};

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user?.id || !user?.role) {
    return {
      user: null,
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  return { user, error: null };
}

export async function requireRoles(roles: UserRole[]) {
  const { user, error } = await requireUser();
  if (error || !user) return { user: null, error };

  if (!roles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }),
    };
  }

  return { user, error: null };
}
