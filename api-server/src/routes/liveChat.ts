import { Router } from "express";
import { db } from "@workspace/db";
import { liveChatRequestsTable, liveChatMessagesTable } from "@workspace/db";
import { eq, gt, and } from "drizzle-orm";

const router = Router();

// List requests (admin) — optional ?status filter
router.get("/live-chat", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const rows = status
      ? await db.select().from(liveChatRequestsTable).where(eq(liveChatRequestsTable.status, status)).orderBy(liveChatRequestsTable.createdAt)
      : await db.select().from(liveChatRequestsTable).orderBy(liveChatRequestsTable.createdAt);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to list requests" });
  }
});

// Create request (visitor)
router.post("/live-chat", async (req, res) => {
  try {
    const { visitorName, topic } = req.body as { visitorName: string; topic: string };
    if (!visitorName?.trim() || !topic?.trim()) {
      res.status(400).json({ error: "visitorName and topic required" });
      return;
    }
    const [row] = await db.insert(liveChatRequestsTable).values({
      visitorName: visitorName.trim(),
      topic: topic.trim(),
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to create request" });
  }
});

// Get single request (visitor polls status)
router.get("/live-chat/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(liveChatRequestsTable).where(eq(liveChatRequestsTable.id, id));
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to get request" });
  }
});

// Accept (admin)
router.put("/live-chat/:id/accept", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.update(liveChatRequestsTable)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(liveChatRequestsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to accept" });
  }
});

// Reject (admin)
router.put("/live-chat/:id/reject", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.update(liveChatRequestsTable)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(liveChatRequestsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to reject" });
  }
});

// Close (admin or visitor)
router.put("/live-chat/:id/close", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.update(liveChatRequestsTable)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(liveChatRequestsTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to close" });
  }
});

// Get messages
router.get("/live-chat/:id/messages", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const afterId = req.query.after ? Number(req.query.after) : 0;
    const rows = afterId > 0
      ? await db.select().from(liveChatMessagesTable)
          .where(and(eq(liveChatMessagesTable.requestId, id), gt(liveChatMessagesTable.id, afterId)))
          .orderBy(liveChatMessagesTable.createdAt)
      : await db.select().from(liveChatMessagesTable)
          .where(eq(liveChatMessagesTable.requestId, id))
          .orderBy(liveChatMessagesTable.createdAt);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send message
router.post("/live-chat/:id/messages", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { senderRole, content } = req.body as { senderRole: string; content: string };
    if (!content?.trim()) { res.status(400).json({ error: "content required" }); return; }
    const [msg] = await db.insert(liveChatMessagesTable).values({
      requestId: id,
      senderRole: senderRole || "visitor",
      content: content.trim(),
    }).returning();
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
