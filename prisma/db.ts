import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";


const { PrismaClient } = pkg;

const prismaClientSingleton = () => {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined");
    }
    const pool = new PrismaPg({ connectionString: DATABASE_URL });
    return new PrismaClient({ adapter: pool });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;