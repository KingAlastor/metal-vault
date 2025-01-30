// Prisma model types

export type PrismaBandFollowersModel = {
  findUnique: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<any>;
  deleteMany: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
};

type PrismaBandUnFollowersModel = {
  findMany: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
};

type PrismaUserUnFollowersModel = {
  create: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any>;
}
