import { Prisma, PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  console.log('Initializing new Prisma Client')
  console.log('NODE_ENV:', process.env.NODE_ENV);

  const client = new PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>({
    log: ['query', 'info', 'warn', 'error'],
  })

  console.log('Setting up Prisma query listener');
  client.$on('query', (e) => {
    try {
      console.log('Query event received:');
      console.log('Query:', e.query);
      console.log('Params:', e.params);
      console.log('Duration:', e.duration + 'ms');
    } catch (error) {
      console.error('Error in query listener:', error);
    }
  })
  
  return client
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

if (process.env.NODE_ENV !== 'production') {
  prisma.$use(async (params, next) => {
    console.log('Middleware triggered:', params.model, params.action);
    return next(params);
  });
  
  // Test query
  prisma.user.findMany().then(() => console.log('Test query executed'));
}