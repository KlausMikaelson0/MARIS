import { Router, type IRouter } from "express";
import { db, productSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const PRODUCT_IDS = ["launch", "brand", "elite", "custom"];

const router: IRouter = Router();

router.get("/product-settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productSettingsTable);

  // Ensure all 4 products have settings rows (upsert defaults if missing)
  const found = new Set(rows.map(r => r.productId));
  const missing = PRODUCT_IDS.filter(id => !found.has(id));

  if (missing.length > 0) {
    await db.insert(productSettingsTable).values(
      missing.map(productId => ({ productId, listed: true, ratingsEnabled: false }))
    ).onConflictDoNothing();
    const all = await db.select().from(productSettingsTable);
    res.json(all);
    return;
  }

  res.json(rows);
});

router.put("/product-settings/:productId", async (req, res): Promise<void> => {
  const { productId } = req.params;
  const { listed, ratingsEnabled } = req.body;

  const [row] = await db
    .insert(productSettingsTable)
    .values({ productId, listed: listed ?? true, ratingsEnabled: ratingsEnabled ?? false })
    .onConflictDoUpdate({
      target: productSettingsTable.productId,
      set: {
        ...(listed !== undefined ? { listed } : {}),
        ...(ratingsEnabled !== undefined ? { ratingsEnabled } : {}),
        updatedAt: new Date(),
      },
    })
    .returning();

  res.json(row);
});

export default router;
