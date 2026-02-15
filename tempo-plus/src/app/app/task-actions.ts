"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(300),
  notes: z.string().max(5000).optional(),
  dueAt: z.string().nullable().optional(),
  estimateMin: z.number().int().min(0).max(24 * 60).nullable().optional(),
});

export async function updateTask(input: unknown) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const data = updateSchema.parse(input);

  const task = await prisma.task.findUnique({ where: { id: data.id }, select: { creatorId: true } });
  if (!task || task.creatorId !== dbUser.id) throw new Error("FORBIDDEN");

  const dueAt = data.dueAt ? new Date(data.dueAt) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) throw new Error("INVALID_DUE_AT");

  await prisma.task.update({
    where: { id: data.id },
    data: {
      title: data.title,
      notes: data.notes ?? null,
      dueAt,
      estimateMin: data.estimateMin ?? null,
    },
  });

  revalidatePath("/app");
}
