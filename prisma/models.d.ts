// Prisma model types

export type PrismaBandFollowersModel = {
  findMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
};

export type PrismaUserPostsModel = {
  findMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
}

export type PrismaBandFollowersModel = {
  findMany: (args: any) => Promise<any>;
}