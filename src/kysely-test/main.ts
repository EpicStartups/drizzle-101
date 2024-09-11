import { Kysely, PostgresDialect, sql } from "kysely";
import { DB } from "kysely-codegen";
import { Pool } from "pg";

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
async function advancedQuery(
  businessCode: string,
  creditTerm?: number,
  description?: string,
) {
  const result = await db
    .with("filtered_business", (qb) =>
      qb
        .withSchema("finance")
        .selectFrom("business_profiles")
        .where("business_profiles.code", "=", businessCode)
        .select("id"),
    )
    .withSchema("finance")
    .selectFrom("generic_transactions")
    .leftJoin(
      "filtered_business",
      "filtered_business.id",
      "generic_transactions.business_profile_id",
    )
    .selectAll("generic_transactions")
    .$if(Boolean(creditTerm), (qb) =>
      qb.where("generic_transactions.amount", ">=", "12"),
    )
    .$if(Boolean(description), (qb) =>
      qb.where(
        sql`lower(generic_transactions.description) like ${`%${description!.toLowerCase()}%`}`,
      ),
    )
    .execute();

  console.log("Advanced query result:", result);
  return result;
}

async function main() {
  const creditTerm = 28;
  const description = "";
  const businessCode = "T20001";

  console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);

  let transactionsQuery = db
    .withSchema("finance")
    .selectFrom("generic_transactions")
    .leftJoin(
      "business_profiles",
      "business_profiles.id",
      "generic_transactions.business_profile_id",
    )
    .where("business_profiles.code", "ilike", `%${businessCode}%`)
    .selectAll();

  if (creditTerm) {
    transactionsQuery = transactionsQuery.where(
      "credit_term",
      ">=",
      creditTerm,
    );
  }

  if (description) {
    transactionsQuery = transactionsQuery.where(
      sql`lower(generic_transactions.description) like ${`%${description.toLowerCase()}%`}`,
    );
  }

  const transactions = await transactionsQuery.limit(5).execute();
  console.log("transactions", transactions);
  const result = await advancedQuery("DT1-00002", 28, "some description");
  console.log("result advaned query: ", result);
}

main();
