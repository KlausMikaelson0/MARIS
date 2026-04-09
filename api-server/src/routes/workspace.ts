import { Router } from "express";
import { db, projectsTable, projectMessagesTable, changeOrdersTable, clientsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

async function getProjectByRef(ref: string) {
  const rows = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      description: projectsTable.description,
      status: projectsTable.status,
      milestone: projectsTable.milestone,
      edd: projectsTable.edd,
      orderRef: projectsTable.orderRef,
      storeUrl: projectsTable.storeUrl,
      createdAt: projectsTable.createdAt,
      deliveredAt: projectsTable.deliveredAt,
      clientName: clientsTable.name,
      clientEmail: clientsTable.email,
    })
    .from(projectsTable)
    .leftJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
    .where(eq(projectsTable.orderRef, ref.toUpperCase()))
    .limit(1);
  return rows[0] ?? null;
}

router.get("/workspace/:ref", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) {
    res.status(404).json({ error: "Project not found. Check your order reference code." });
    return;
  }
  res.json(project);
});

router.get("/workspace/:ref/messages", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const msgs = await db
    .select()
    .from(projectMessagesTable)
    .where(eq(projectMessagesTable.projectId, project.id))
    .orderBy(asc(projectMessagesTable.createdAt));
  res.json(msgs);
});

router.post("/workspace/:ref/messages", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const { content } = req.body as { content?: string };
  if (!content?.trim()) { res.status(400).json({ error: "Message content required" }); return; }
  const [msg] = await db.insert(projectMessagesTable).values({
    projectId: project.id,
    sender: "client",
    content: content.trim(),
  }).returning();
  res.status(201).json(msg);
});

router.get("/workspace/:ref/change-orders", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const orders = await db
    .select()
    .from(changeOrdersTable)
    .where(eq(changeOrdersTable.projectId, project.id))
    .orderBy(asc(changeOrdersTable.createdAt));
  res.json(orders);
});

router.post("/workspace/:ref/change-orders", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const { reasonCategory, details } = req.body as { reasonCategory?: string; details?: string };
  if (!details?.trim()) { res.status(400).json({ error: "Details required" }); return; }
  const validCategories = ["modification", "new_feature", "design_change"];
  const cat = validCategories.includes(reasonCategory ?? "") ? reasonCategory! : "modification";
  const [co] = await db.insert(changeOrdersTable).values({
    projectId: project.id,
    amount: "0",
    reasonCategory: cat,
    details: details.trim(),
    status: "pending_review",
    requestedBy: "client",
  }).returning();
  res.status(201).json(co);
});

router.patch("/workspace/:ref/change-orders/:coId/approve", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const coId = parseInt(req.params.coId);
  const [co] = await db
    .select()
    .from(changeOrdersTable)
    .where(eq(changeOrdersTable.id, coId))
    .limit(1);
  if (!co || co.projectId !== project.id) { res.status(404).json({ error: "Change order not found" }); return; }
  if (co.status !== "quoted") { res.status(400).json({ error: "Can only approve quoted change orders" }); return; }
  const [updated] = await db
    .update(changeOrdersTable)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(changeOrdersTable.id, coId))
    .returning();
  res.json(updated);
});

router.patch("/workspace/:ref/change-orders/:coId/reject", async (req, res): Promise<void> => {
  const project = await getProjectByRef(req.params.ref);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const coId = parseInt(req.params.coId);
  const [co] = await db
    .select()
    .from(changeOrdersTable)
    .where(eq(changeOrdersTable.id, coId))
    .limit(1);
  if (!co || co.projectId !== project.id) { res.status(404).json({ error: "Change order not found" }); return; }
  const [updated] = await db
    .update(changeOrdersTable)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(changeOrdersTable.id, coId))
    .returning();
  res.json(updated);
});

export default router;
