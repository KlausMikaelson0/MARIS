import { Router } from "express";
import { db, projectsTable, projectMessagesTable, changeOrdersTable, clientsTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";

const router = Router();

router.get("/admin/workspace/projects", async (req, res): Promise<void> => {
  const projects = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      status: projectsTable.status,
      milestone: projectsTable.milestone,
      edd: projectsTable.edd,
      orderRef: projectsTable.orderRef,
      storeUrl: projectsTable.storeUrl,
      description: projectsTable.description,
      createdAt: projectsTable.createdAt,
      deliveredAt: projectsTable.deliveredAt,
      clientId: projectsTable.clientId,
      clientName: clientsTable.name,
      clientEmail: clientsTable.email,
      clientPhone: clientsTable.phone,
    })
    .from(projectsTable)
    .leftJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
    .orderBy(desc(projectsTable.createdAt));
  res.json(projects);
});

router.post("/admin/workspace/projects", async (req, res): Promise<void> => {
  const { clientName, clientEmail, clientPhone, title, description, orderRef, edd, milestone, status } =
    req.body as {
      clientName?: string;
      clientEmail?: string;
      clientPhone?: string;
      title?: string;
      description?: string;
      orderRef?: string;
      edd?: string;
      milestone?: string;
      status?: string;
    };

  if (!title?.trim() || !clientEmail?.trim() || !clientName?.trim()) {
    res.status(400).json({ error: "title, clientName, and clientEmail are required" });
    return;
  }

  const normalizedRef = orderRef?.trim().toUpperCase() || `MARIS-${Date.now()}`;

  let clientId: number;
  const existing = await db.select().from(clientsTable).where(eq(clientsTable.email, clientEmail.trim())).limit(1);
  if (existing.length) {
    clientId = existing[0].id;
  } else {
    const [newClient] = await db.insert(clientsTable).values({
      name: clientName.trim(),
      email: clientEmail.trim(),
      phone: clientPhone?.trim() ?? null,
    }).returning();
    clientId = newClient.id;
  }

  const [project] = await db.insert(projectsTable).values({
    clientId,
    title: title.trim(),
    description: description?.trim() ?? null,
    orderRef: normalizedRef,
    edd: edd ? new Date(edd) : null,
    milestone: milestone ?? "discovery",
    status: status ?? "scoping",
  }).returning();

  res.status(201).json({ ...project, clientName, clientEmail });
});

router.patch("/admin/workspace/projects/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status, milestone, edd, storeUrl, description, title } = req.body as {
    status?: string;
    milestone?: string;
    edd?: string | null;
    storeUrl?: string;
    description?: string;
    title?: string;
  };

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (milestone !== undefined) updates.milestone = milestone;
  if (edd !== undefined) updates.edd = edd ? new Date(edd) : null;
  if (storeUrl !== undefined) updates.storeUrl = storeUrl;
  if (description !== undefined) updates.description = description;
  if (title !== undefined) updates.title = title;

  const [updated] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Project not found" }); return; }
  res.json(updated);
});

router.get("/admin/workspace/projects/:id/messages", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const msgs = await db
    .select()
    .from(projectMessagesTable)
    .where(eq(projectMessagesTable.projectId, id))
    .orderBy(asc(projectMessagesTable.createdAt));
  res.json(msgs);
});

router.post("/admin/workspace/projects/:id/messages", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { content } = req.body as { content?: string };
  if (!content?.trim()) { res.status(400).json({ error: "Content required" }); return; }
  const [msg] = await db.insert(projectMessagesTable).values({
    projectId: id,
    sender: "admin",
    content: content.trim(),
  }).returning();
  res.status(201).json(msg);
});

router.get("/admin/workspace/projects/:id/change-orders", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const orders = await db
    .select()
    .from(changeOrdersTable)
    .where(eq(changeOrdersTable.projectId, id))
    .orderBy(desc(changeOrdersTable.createdAt));
  res.json(orders);
});

router.post("/admin/workspace/projects/:id/change-orders", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { amount, reasonCategory, details } = req.body as {
    amount?: number | string;
    reasonCategory?: string;
    details?: string;
  };
  if (!details?.trim()) { res.status(400).json({ error: "Details required" }); return; }
  const validCategories = ["modification", "new_feature", "design_change"];
  const cat = validCategories.includes(reasonCategory ?? "") ? reasonCategory! : "modification";
  const [co] = await db.insert(changeOrdersTable).values({
    projectId: id,
    amount: String(amount ?? "0"),
    reasonCategory: cat,
    details: details.trim(),
    status: "quoted",
    requestedBy: "admin",
    quotedAmount: String(amount ?? "0"),
  }).returning();
  res.status(201).json(co);
});

router.patch("/admin/workspace/projects/:id/change-orders/:coId", async (req, res): Promise<void> => {
  const coId = parseInt(req.params.coId);
  const { status, adminNote, quotedAmount } = req.body as {
    status?: string;
    adminNote?: string;
    quotedAmount?: string | number;
  };
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) updates.status = status;
  if (adminNote !== undefined) updates.adminNote = adminNote;
  if (quotedAmount !== undefined) updates.quotedAmount = String(quotedAmount);

  const [updated] = await db
    .update(changeOrdersTable)
    .set(updates)
    .where(eq(changeOrdersTable.id, coId))
    .returning();
  if (!updated) { res.status(404).json({ error: "Change order not found" }); return; }
  res.json(updated);
});

export default router;
