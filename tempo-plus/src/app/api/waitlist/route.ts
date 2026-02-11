import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  goal: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);

    await prisma.waitlistSignup.upsert({
      where: { email: body.email },
      update: { goal: body.goal ?? null },
      create: { email: body.email, goal: body.goal ?? null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // In early dev it is common to not have DB configured yet.
    console.error("waitlist_signup_failed", err);
    return NextResponse.json(
      { ok: false, error: "WAITLIST_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
