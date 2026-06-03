import { prisma } from "../config/prisma.js";

export async function logActivity(activityType: string, title: string, amount = 0) {
  await prisma.activityLog.create({
    data: { activityType, title, amount },
  });
}
