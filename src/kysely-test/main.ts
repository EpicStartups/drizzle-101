import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import { Pool } from "pg";

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

async function main() {
  const creditTerm = true;
  const description =
    "deposit transaction at Wilderman - Legros using card ending with ***(...8555) for RON 599.35 in account ***24141293";
  console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
  let transactionsQuery = db
    .withSchema("finance")
    .selectFrom("generic_transactions")
    .leftJoin(
      "business_profiles",
      "business_profiles.id",
      "generic_transactions.business_profile_id",
    )
    .selectAll();

  if (creditTerm) {
    transactionsQuery = transactionsQuery.where((eb) =>
      eb.and([eb("credit_term", ">=", 28)]),
    );
  }
  const transactions = await transactionsQuery
    .where((eb) => eb("generic_transactions.description", "ilike", description))
    .limit(5)
    .execute();
  console.log("tranasctions", transactions);
}

main();
