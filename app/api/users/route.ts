import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireRoles } from "@/lib/server/auth";
import { validateUserPayload } from "@/lib/server/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assignable = searchParams.get("assignable") === "true";

  const guard = assignable ? await requireRoles(["ADMIN", "ALIADO"]) : await requireRoles(["ADMIN"]);
  if (guard.error) return guard.error;

  const users = await prisma.user.findMany({
    where: assignable ? { role: { in: ["ADMIN", "GERENTE"] }, active: true } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          leadsResponsible: true,
        },
      },
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { error } = await requireRoles(["ADMIN"]);
  if (error) return error;

  const body = await request.json();
  const validationError = validateUserPayload(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      role: body.role,
      passwordHash,
      active: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          leadsResponsible: true,
        },
      },
    },
  });

  return NextResponse.json(user, { status: 201 });
}
