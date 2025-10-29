import "postgres";

declare module "postgres" {
  interface Sql<T = {}> extends Function {
    join(values: any[], separator: any): ReturnType<Sql<T>>;
    array(values: any[], type: string): ReturnType<Sql<T>>;
    text(value: string): ReturnType<Sql<T>>;
    int(value: number): ReturnType<Sql<T>>;
    json(value: any): ReturnType<Sql<T>>;
    jsonb(value: any): ReturnType<Sql<T>>;
    unsafe(value: string): ReturnType<Sql<T>>;
  }
}
