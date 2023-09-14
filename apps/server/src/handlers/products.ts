import Elysia, { t } from "elysia";
import { baseApp } from "../base";

export const productsHandlers = new Elysia({ name: "products" })
  .use(baseApp)
  .get(
    "/products",
    async ({ db }) => {
      const products = await db.product.findMany();
      return products;
    },
    {
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            description: t.Union([t.String(), t.Null()]),
            price: t.Number(),
          }),
          { description: "Validation Success" }
        ),
      },
      detail: { tags: ["products"] },
    }
  )
  .post(
    "/products",
    async ({ ensureAuthentication, db, body, jwt, headers }) => {
      const userId = await ensureAuthentication({ headers, jwt });

      const product = await db.product.create({
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
          creatorId: userId,
        },
      });

      return { product };
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 3,
          title: "Product Name",
        }),
        description: t.String({ title: "Product Description" }),
        price: t.Number({ title: "Product Price" }),
      }),

      detail: {
        tags: ["products"],
        security: [{ bearerToken: [] }],
      },
    }
  );
