// Prisma model types

export type PrismaBandFollowersModel = {
  findMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<any>;
  deleteMany: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>; 
};

export type PrismaUserPostsModel = {
  findMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>; 
}

export type PrismaBandFollowersModel = {
  findMany: (args: any) => Promise<any>;
}