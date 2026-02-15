"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(300),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

export async function updateEvent(input: unknown) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const data = updateSchema.parse(input);
  const start = new Date(data.startAt);
  const end = new Date(data.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("INVALID_DATE");
  if (end <= start) throw new Error("END_BEFORE_START");

  const ev = await prisma.calendarEvent.findUnique({ where: { id: data.id }, select: { creatorId: true } });
  if (!ev || ev.creatorId !== dbUser.id) throw new Error("FORBIDDEN");

  await prisma.calendarEvent.update({
    where: { id: data.id },
    data: { title: data.title, startAt: start, endAt: end },
  });

  revalidatePath("/app");
}
