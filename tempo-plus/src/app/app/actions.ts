"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensurePersonalSpace } from "@/lib/app-data";

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const space = await ensurePersonalSpace(dbUser.id);

  await prisma.task.create({
    data: {
      title,
      spaceId: space.id,
      creatorId: dbUser.id,
      status: "BACKLOG",
    },
  });

  revalidatePath("/app");
}

export async function toggleTaskDone(taskId: string, done: boolean) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { creatorId: true } });
  if (!task || task.creatorId !== dbUser.id) throw new Error("FORBIDDEN");

  await prisma.task.update({
    where: { id: taskId },
    data: { status: done ? "DONE" : "BACKLOG" },
  });

  revalidatePath("/app");
}

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const title = String(formData.get("title") ?? "").trim();
  const startAt = String(formData.get("startAt") ?? "").trim();
  const endAt = String(formData.get("endAt") ?? "").trim();
  if (!title) throw new Error("TITLE_REQUIRED");
  if (!startAt || !endAt) throw new Error("DATES_REQUIRED");

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("INVALID_DATE");
  if (end <= start) throw new Error("END_BEFORE_START");

  const space = await ensurePersonalSpace(dbUser.id);

  await prisma.calendarEvent.create({
    data: {
      title,
      startAt: start,
      endAt: end,
      spaceId: space.id,
      creatorId: dbUser.id,
    },
  });

  revalidatePath("/app");
}

export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const ev = await prisma.calendarEvent.findUnique({ where: { id: eventId }, select: { creatorId: true } });
  if (!ev || ev.creatorId !== dbUser.id) throw new Error("FORBIDDEN");

  await prisma.calendarEvent.delete({ where: { id: eventId } });
  revalidatePath("/app");
}
