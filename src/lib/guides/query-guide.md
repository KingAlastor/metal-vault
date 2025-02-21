# Query Guide

## Do not use single quotes for values as they are used as strings and bypass sanitazation
## ${value} is called template literal tagging and parameterized query

```typescript
import sql from "@/lib/db";

export const getUserById = async (id: string) => {
  const user = await sql`SELECT * FROM users WHERE id = ${id}`;
  return user;
};
```

## You can use return type check types on compile time

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export const testSqlQuery = async (id: string): Promise<User | undefined> => {
  const user = await sql<User>`
    select * from users where id = ${id} limit 1
  `;
  console.log("server side user", user);
  return user[0];
};
```

## Using transactions for a query

```typescript
export const transferFunds = async (fromUserId: string, toUserId: string, amount: number) => {
  try {
    await sql.begin(async (sql) => {
      await sql`UPDATE users SET name = ${newName} WHERE id = ${userId}`;
      await sql`UPDATE users SET email = ${newEmail} WHERE id = ${userId}`;
    });
    return { success: true };
  } catch (error) {
    console.error("Error transferring funds:", error);
    return { success: false, error: "Failed to transfer funds" };
  }
};
```

## Loading query from a file

```typescript 
// src/sql/get_user_by_id.sql
SELECT * FROM users WHERE id = $1

export const getUserById = async (id: string) => {
  const user = await sql.file("./src/sql/get_user_by_id.sql", [id]);
  return user;
};
```

## Helpter functions

```typescript
export const isValidUserId = async (userId: string): Promise<boolean> => {
  const result = await sql`SELECT EXISTS (SELECT 1 FROM users WHERE id = ${userId})`;
  return result[0].exists;
};

// 
import { isValidUserId } from "@/lib/db_helpers";

if (!await isValidUserId(userId)) {
  return { success: false, error: "Invalid user ID" };
}
```
