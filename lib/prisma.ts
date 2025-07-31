import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma client with error handling for restricted environments
export let prisma: PrismaClient;

try {
  prisma = globalThis.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
} catch (error) {
  console.warn('Prisma client initialization failed. This may be due to missing binaries in restricted environments.');
  console.warn('Error:', error);
  
  // Create a mock Prisma client for build environments where binaries aren't available
  prisma = {
    $connect: async () => { throw new Error('Prisma client not initialized - binaries missing') },
    $disconnect: async () => {},
    user: {} as any,
    account: {} as any,
    session: {} as any,
    verificationToken: {} as any,
    category: {} as any,
    product: {} as any,
    automationConfig: {} as any,
  } as any;
  
  if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
}
