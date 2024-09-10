import { Lucia, TimeSpan } from "lucia";
import { db, adapter } from "./conn";
import type { InsertUser } from "@/db/schemaTypes";
import { user, sessionTable } from "./schema";
import { eq } from "drizzle-orm";

const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"), // 2 weeks
  sessionCookie: {
    name: "auth_session",
    expires: false, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      email: attributes.email,
      role: attributes.role,
    };
  },
});

// Declare module for type safety
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      name: string;
      email: string;
      role: string;
    };
  }
}

async function main() {
  try {
    // 1. Create a new user
    const payloadUser: InsertUser = {
      name: "John Doe",
      password: "password123",
      role: "customer",
      email: "john.doe1@example.com",
      phoneNumber: "+1234567890",
      loyaltyPoints: 0,
    };

    const [newUser] = await db.insert(user).values(payloadUser).returning();
    console.log("New user created:", newUser);

    // 2. Create a session for the new user
    const session = await lucia.createSession(newUser.id, {});
    console.log("New session created:", session);

    // 3. Validate the session
    const { session: validatedSession, user: userResult } =
      await lucia.validateSession(session.id);
    console.log("Validated session:", validatedSession);
    console.log("User from validated session:", userResult);

    // 4. Invalidate the session (sign out)
    await lucia.invalidateSession(session.id);
    console.log("Session invalidated");

    // 5. Attempt to validate the invalidated session
    const { session: invalidatedSession } = await lucia.validateSession(
      session.id,
    );
    console.log("Attempt to validate invalidated session:", invalidatedSession);

    // 6. Create multiple sessions for the user
    const session1 = await lucia.createSession(newUser.id, {});
    const session2 = await lucia.createSession(newUser.id, {});
    console.log("Multiple sessions created");

    // 7. Get all user sessions
    const userSessions = await lucia.getUserSessions(newUser.id);
    console.log("User sessions:", userSessions);

    // 8. Invalidate all user sessions
    await lucia.invalidateUserSessions(newUser.id);
    console.log("All user sessions invalidated");

    // 9. Attempt to validate after invalidating all sessions
    const { session: afterInvalidationSession } = await lucia.validateSession(
      session1.id,
    );
    console.log(
      "Attempt to validate after invalidating all sessions:",
      afterInvalidationSession,
    );

    // 10. Create a session with custom attributes
    const sessionWithAttributes = await lucia.createSession(newUser.id, {});
    console.log("Session with custom attributes:", sessionWithAttributes);

    // 11. Delete expired sessions (for demonstration, as we don't have any expired sessions)
    await lucia.deleteExpiredSessions();
    console.log("Deleted expired sessions");

    // 12. Clean up - delete all sessions for the user first, then delete the user
    await db.delete(sessionTable).where(eq(sessionTable.userId, newUser.id));
    console.log("All user sessions deleted from the database");

    await db.delete(user).where(eq(user.id, newUser.id));
    console.log("Test user deleted");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the database connection
    console.log("Database connection closed");
  }
}

main();
