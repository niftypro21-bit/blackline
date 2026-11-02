"use server";

import { prisma } from "@/lib/prisma";

export async function listOrganizationsForSelect() {
  return prisma.organization.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listPersonsForSelect() {
  return prisma.person.findMany({
    where: { archived: false },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, nickname: true },
  });
}

export async function listLocationsForSelect() {
  return prisma.location.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listVehiclesForSelect() {
  return prisma.vehicle.findMany({
    where: { archived: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, make: true, model: true, plate: true },
  });
}
