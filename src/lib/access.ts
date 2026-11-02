import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/constants";

// Le OWNER voit toujours tout (bypass des tables d'acces). Les autres roles sont
// filtres par GroupMember/ChannelMember : l'acces doit etre accorde explicitement.

export async function hasGroupAccess(userId: string, role: UserRole, groupId: string): Promise<boolean> {
  if (role === "OWNER") return true;
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  return membership !== null;
}

export async function hasChannelAccess(userId: string, role: UserRole, channelId: string): Promise<boolean> {
  if (role === "OWNER") return true;
  const membership = await prisma.channelMember.findUnique({
    where: { userId_channelId: { userId, channelId } },
  });
  return membership !== null;
}

export async function listAccessibleGroups(userId: string, role: UserRole) {
  if (role === "OWNER") {
    return prisma.group.findMany({ orderBy: { name: "asc" } });
  }
  return prisma.group.findMany({
    where: { members: { some: { userId } } },
    orderBy: { name: "asc" },
  });
}

export async function listAccessibleChannels(userId: string, role: UserRole, groupId: string) {
  if (role === "OWNER") {
    return prisma.channel.findMany({ where: { groupId }, orderBy: { name: "asc" } });
  }
  return prisma.channel.findMany({
    where: { groupId, members: { some: { userId } } },
    orderBy: { name: "asc" },
  });
}

export async function listAccessibleGroupIds(userId: string, role: UserRole): Promise<string[]> {
  const groups = await listAccessibleGroups(userId, role);
  return groups.map((g) => g.id);
}
