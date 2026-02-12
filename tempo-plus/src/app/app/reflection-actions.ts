"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfTodayUTC() {
  const now = new Date();
  // Normalize to 00:00 UTC for uniqueness
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function saveReflection(content: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) throw new Error("USER_NOT_FOUND");

  const trimmed = String(content ?? "").trim();
  if (!trimmed) throw new Error("EMPTY");

  const date = startOfTodayUTC();

  await prisma.reflectionEntry.upsert({
    where: { userId_date: { userId: dbUser.id, date } },
    update: { content: trimmed },
    create: { userId: dbUser.id, date, content: trimmed },
  });

  revalidatePath("/app");
}
