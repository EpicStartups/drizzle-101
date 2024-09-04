import {
  db,
  insertUserSchema,
  insertHobbiesSchema,
  selectUserSchema,
  CreateHobbies,
  SelectUser,
  hobbies,
} from "./schema";
import { CreateUser } from "./schema";
import { user } from "./schema";

async function main() {
  const payloadUser: CreateUser = {
    id: 123213,
    name: "very long name",
    email: "jenny@hotmail.com",
    password: "test",
    roleEnum: "adminss",
  };

  const payloadHobbies: CreateHobbies = {
    id: 12213,
    description: "some description",
    hobby: "Swimming",
  };

  const insertHobby = insertHobbiesSchema.parse(payloadHobbies);

  const parsedInsert = insertUserSchema.parse(payloadUser);
  console.log("zod schema parse");
  console.log(parsedInsert);

  const parsedSelectUser = selectUserSchema.parse({
    name: true,
  });
  console.log("Selected user: ", parsedSelectUser);

  const hobbyInserted = await db.insert(hobbies).values(insertHobby);
  console.log("hobby inserted");
  console.log(hobbyInserted);

  const userInserted = await db.insert(user).values(parsedInsert).returning({
    name: user.name,
  });
  console.log("user inserted: ", userInserted);
  const users = await db.query.user.findMany({
    columns: {
      name: true,
    },
  });
  console.log(users);
  const deleted = await db.delete(user);
  console.log("deleted");
  console.log(deleted);
}

main();
