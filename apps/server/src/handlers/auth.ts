import Elysia, { t } from "elysia";
import { baseApp } from "../base";
import { BadRequest } from "../errors/bad-request";

export const authHandlers = new Elysia({ name: "auth" })
  .use(baseApp)
  .post(
    "/sign-up",
    async ({ body, db, jwt }) => {
      const hasUserWithSameEmail = await db.user.findUnique({
        where: { email: body.email },
      });

      if (hasUserWithSameEmail) {
        throw new BadRequest("User with same email already exists");
      }

      const hashedPassword = await Bun.password.hash(body.password);

      const user = await db.user.create({
        data: {
          name: body.name,
          email: body.email,
          hashedPassword,
        },
      });

      const token = await jwt.sign({ userId: user.id });

      return { user, token };
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 3,
          title: "User Name",
        }),
        email: t.String({
          format: "email",
          title: "User email",
        }),
        password: t.String({ minLength: 6, title: "User Password" }),
      }),
      response: {
        200: t.Object(
          {
            user: t.Object({
              id: t.String(),
              name: t.String(),
              email: t.String(),
            }),
            token: t.String(),
          },
          { description: "Validation Success" }
        ),
        400: t.Object(
          {
            message: t.String(),
          },
          { description: "Bad request" }
        ),
      },
      detail: { tags: ["auth"] },
    }
  )
  .post(
    "/sign-in",
    async ({ body, db, jwt }) => {
      const user = await db.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        throw new BadRequest("Invalid credentials.");
      }

      const isPasswordValid = await Bun.password.verify(
        body.password,
        user.hashedPassword
      );

      if (!isPasswordValid) {
        throw new BadRequest("Invalid credentials.");
      }

      const token = await jwt.sign({ userId: user.id });
      return { user, token };
    },
    {
      body: t.Object(
        {
          email: t.String({
            format: "email",
            title: "User Email",
          }),
          password: t.String({
            title: "User Password",
          }),
        },
        { title: "Credentials", description: "User credentials" }
      ),
      response: {
        200: t.Object({
          user: t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
          }),
          token: t.String(),
        }),
        400: t.Object({
          message: t.String(),
        }),
      },
      detail: { tags: ["auth"] },
    }
  );
