import { PrismaClient } from "@prisma/client";
import { jwt } from "@elysiajs/jwt";
import Elysia from "elysia";
import { envs } from "./config";
import swagger from "@elysiajs/swagger";
import { BadRequest } from "./errors/bad-request";

export const baseApp = new Elysia({ name: "base" })
  .decorate("db", new PrismaClient())
  .decorate("ensureAuthentication", async ({ headers, jwt }) => {
    const auth = headers.authorization;
    if (!auth) throw new Error("Unauthorized");

    const rawToken = auth.split("Bearer ")[1];
    const token = await jwt.verify(rawToken);
    if (!token) throw new Error("Invalid token");

    return token.userId as string;
  })
  .addError({
    BadRequest: BadRequest,
  })
  .onError((error) => {
    console.log("ON ERROR HANDLER");
    console.log("ERROR CODE:", error.code);
    if (error.code === "BadRequest") {
      error.set.status = 400;

      return {
        message: error.error.message,
      };
    }
  })
  .use(
    jwt({
      secret: envs.JWT_SECRET,
    })
  );
