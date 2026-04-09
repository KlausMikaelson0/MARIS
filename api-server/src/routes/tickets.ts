import { Router, type IRouter } from "express";
import { db, ticketsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateTicketBody,
  UpdateTicketBody,
  GetTicketParams,
  GetTicketResponse,
  UpdateTicketParams,
  UpdateTicketResponse,
  ListTicketsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tickets", async (req, res): Promise<void> => {
  const tickets = await db.select().from(ticketsTable).orderBy(ticketsTable.createdAt);
  res.json(ListTicketsResponse.parse(tickets));
});

router.post("/tickets", async (req, res): Promise<void> => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ticket] = await db.insert(ticketsTable).values({
    clientId: parsed.data.clientId,
    projectId: parsed.data.projectId ?? null,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    creditsCost: parsed.data.creditsCost,
    status: "pending",
  }).returning();

  res.status(201).json(GetTicketResponse.parse(ticket));
});

router.get("/tickets/:id", async (req, res): Promise<void> => {
  const params = GetTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, params.data.id));
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(GetTicketResponse.parse(ticket));
});

router.patch("/tickets/:id", async (req, res): Promise<void> => {
  const params = UpdateTicketParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.resolvedAt !== undefined) updateData.resolvedAt = parsed.data.resolvedAt ? new Date(parsed.data.resolvedAt) : null;

  const [ticket] = await db
    .update(ticketsTable)
    .set(updateData)
    .where(eq(ticketsTable.id, params.data.id))
    .returning();

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(UpdateTicketResponse.parse(ticket));
});

export default router;
