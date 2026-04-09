import { Router, type IRouter } from "express";
import { db, ratingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/ratings", async (req, res): Promise<void> => {
  const { productId } = req.query;
  const rows = productId
    ? await db.select().from(ratingsTable).where(eq(ratingsTable.productId, String(productId))).orderBy(ratingsTable.createdAt)
    : await db.select().from(ratingsTable).orderBy(ratingsTable.createdAt);
  res.json(rows);
});

router.post("/ratings", async (req, res): Promise<void> => {
  const { productId, authorName, rating, comment } = req.body;
  if (!productId || !authorName || !rating) {
    res.status(400).json({ error: "productId, authorName and rating are required" });
    return;
  }
  const r = Number(rating);
  if (r < 1 || r > 5) {
    res.status(400).json({ error: "rating must be 1–5" });
    return;
  }
  const [row] = await db.insert(ratingsTable).values({
    productId: String(productId),
    authorName: String(authorName),
    rating: r,
    comment: comment ? String(comment) : null,
  }).returning();
  res.status(201).json(row);
});

router.delete("/ratings/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(ratingsTable).where(eq(ratingsTable.id, id));
  res.status(204).end();
});

export default router;
