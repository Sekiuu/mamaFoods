import { prisma } from '../../prisma/db';
export function getPrismaClient() {
    return prisma
}
