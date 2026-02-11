import { prisma } from "@/lib/prisma";

export async function ensurePersonalSpace(userId: string) {
  const existing = await prisma.spaceMember.findFirst({
    where: { userId, role: "OWNER" },
    include: { space: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.space;

  const space = await prisma.space.create({
    data: {
      name: "Pessoal",
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return space;
}

export async function getDefaultSpaceId(userId: string) {
  const member = await prisma.spaceMember.findFirst({
    where: { userId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return member?.spaceId ?? null;
}
