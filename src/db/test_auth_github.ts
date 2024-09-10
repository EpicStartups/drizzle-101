// TODO: github api not returning email. so there's issue with inserting user data into db

import { Lucia, TimeSpan } from "lucia";
import { GitHub } from "arctic";
import { db, adapter } from "./conn";
import type { InsertUser } from "@/db/schemaTypes";
import { user, sessionTable } from "./schema";
import Bun from "bun";
import { eq } from "drizzle-orm";
import {
  generateState,
  generateCodeVerifier,
  OAuth2RequestError,
} from "arctic";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

// Set up LogTape
await configure({
  sinks: { console: getConsoleSink() },
  loggers: [{ category: ["github-oauth"], level: "debug", sinks: ["console"] }],
});

const logger = getLogger(["github-oauth"]);

// Initialize Lucia
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
      githubId: attributes.githubId,
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
      githubId: number;
    };
  }
}

// Initialize GitHub OAuth
const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
);

// Bun HTTP server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/login/github") {
      logger.info`Initiating GitHub OAuth flow`;
      const state = generateState();
      const authorizationURL = await github.createAuthorizationURL(state, {
        scopes: ["user:email"],
      });

      logger.debug`Generated authorization URL: ${authorizationURL}`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: authorizationURL.toString(),
          "Set-Cookie": `github_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600`,
        },
      });
    }

    if (url.pathname === "/login/github/callback") {
      logger.info`Received GitHub OAuth callback`;
      const cookies = req.headers.get("Cookie")?.split("; ");
      const stateCookie = cookies
        ?.find((cookie) => cookie.startsWith("github_oauth_state="))
        ?.split("=")[1];
      const state = url.searchParams.get("state");
      const code = url.searchParams.get("code");

      logger.debug`Callback params: state=${state}, code=${code}, stateCookie=${stateCookie}`;

      // Verify state
      if (!stateCookie || !state || stateCookie !== state || !code) {
        logger.warn`Invalid state or missing code`;
        return new Response("Invalid state or missing code", { status: 400 });
      }

      try {
        logger.debug`Validating authorization code`;
        const tokens = await github.validateAuthorizationCode(code);
        logger.info`Authorization code validated successfully`;

        logger.debug`Fetching GitHub user data`;
        const githubUserResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        const githubUser: { id: number; login: string; email: string } =
          await githubUserResponse.json();
        logger.debug`GitHub user data fetched: ${JSON.stringify(githubUser)}`;

        // Check if user exists
        logger.debug`Checking if user exists in database`;
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.githubId, String(githubUser.id)))
          .limit(1);

        let userId: string;
        if (existingUser.length > 0) {
          logger.info`Existing user found: ${existingUser[0].id}`;
          userId = existingUser[0].id;
        } else {
          logger.info`Creating new user`;
          // Create new user
          const payloadUser: InsertUser = {
            name: githubUser.login,
            email: githubUser.email,
            role: "customer",
            password: "", // You might want to handle this differently for OAuth users
            githubId: String(githubUser.id),
            loyaltyPoints: 0,
          };

          const [newUser] = await db
            .insert(user)
            .values(payloadUser)
            .returning();
          userId = newUser.id;
          logger.info`New user created: ${newUser.id}`;
        }

        // Create session
        logger.debug`Creating new session for user: ${userId}`;
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        logger.info`New session created: ${session.id}`;

        return new Response("Authentication successful", {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
          },
        });
      } catch (e) {
        if (e instanceof OAuth2RequestError) {
          logger.error`OAuth2RequestError: ${e.message}`;
          return new Response("Invalid code", { status: 400 });
        }
        logger.error`Unexpected error: ${e}`;
        return new Response("Internal server error", { status: 500 });
      }
    }

    // ... (rest of the code remains the same)

    return new Response("Not found", { status: 404 });
  },
});

logger.info`Server running at http://localhost:${server.port}`;
