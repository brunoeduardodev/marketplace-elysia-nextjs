import { Elysia } from "elysia";
import { baseApp } from "./base";
import { authHandlers } from "./handlers/auth";
import swagger from "@elysiajs/swagger";
import { productsHandlers } from "./handlers/products";

const app = new Elysia()
  .use(baseApp)
  .use(authHandlers)
  .use(productsHandlers)
  .use(
    swagger({
      documentation: {
        info: {
          title: "Marketplace API Documentation",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerToken: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    })
  )

  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

console.log("Swagger docs at http://localhost:3000/swagger");
