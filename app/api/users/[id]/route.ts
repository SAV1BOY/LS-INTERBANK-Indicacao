import { requireRoles } from "@/lib/server/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireRoles(["ADMIN"]);
  if (error) return error;
  const body = await request.json();

  const data: any = {
    name: body?.name,
    email: body?.email,
    role: body?.role,
    active: body?.active,
  };

  if (body?.password) {
    data.passwordHash = await bcrypt.hash(body.password, 12);
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
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

  return NextResponse.json(user);
}

export async function DELETE(_: Request, { params }: Params) {
  const { error } = await requireRoles(["ADMIN"]);
  if (error) return error;
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
