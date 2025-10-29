import sql from "@/lib/db";

export async function insertMany<T extends Record<string, any>>(
  tableName: string,
  rows: T[],
  conflictKey?: keyof T,
  updateColumns?: (keyof T)[],
  chunkSize = 1000
) {
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);

    const rowFragments = chunk.map(
      (row) =>
        sql`(${sql.join(
          columns.map((col) => {
            const val = row[col];
            if (Array.isArray(val)) {
              const type = detectPgArrayType(val);
              return sql.array(val, type);
            }
            return val;
          }),
          sql`, `
        )})`
    );

    const valuesFragment = sql.join(rowFragments, sql`, `);

    let query = sql`
      INSERT INTO ${sql.unsafe(tableName)} (${sql.join(
      columns.map(sql.unsafe),
      sql`, `
    )})
      VALUES ${valuesFragment}
    `;

    if (conflictKey) {
      query = sql`
        ${query}
        ON CONFLICT (${sql.unsafe(conflictKey as string)})
        DO ${
          updateColumns?.length
            ? sql`UPDATE SET ${sql.join(
                updateColumns.map(
                  (col) =>
                    sql`${sql.unsafe(col as string)} = EXCLUDED.${sql.unsafe(
                      col as string
                    )}`
                ),
                sql`, `
              )}`
            : sql`NOTHING`
        }
      `;
    }

    await sql`${query}`;
  }
}

function detectPgArrayType(arr: any[]): string {
  if (!arr.length) return "text"; // default if empty

  const first = arr[0];

  if (typeof first === "string") {
    // simple heuristic for UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(first) ? "uuid" : "text";
  }
  if (typeof first === "number") return "int4"; // integer arrays
  if (typeof first === "boolean") return "bool";
  return "text"; // fallback
}
