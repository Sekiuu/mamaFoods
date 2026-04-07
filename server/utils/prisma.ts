import { PrismaClient } from '@prisma/client'
import { prisma } from '../../prisma/db';

export function getPrismaClient() {
    return prisma
}
