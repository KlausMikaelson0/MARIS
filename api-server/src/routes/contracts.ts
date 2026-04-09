import { Router, type IRouter } from "express";
import { db, contractsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateContractBody,
  GetContractParams,
  GetContractResponse,
  ListContractsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/contracts", async (req, res): Promise<void> => {
  const contracts = await db.select().from(contractsTable).orderBy(contractsTable.createdAt);
  res.json(ListContractsResponse.parse(contracts));
});

router.post("/contracts", async (req, res): Promise<void> => {
  const parsed = CreateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [contract] = await db.insert(contractsTable).values({
    clientId: parsed.data.clientId,
    projectId: parsed.data.projectId ?? null,
    type: parsed.data.type,
    signedByName: parsed.data.signedByName,
    signedByEmail: parsed.data.signedByEmail,
    documentUrl: parsed.data.documentUrl ?? null,
    signedAt: new Date(),
    status: "signed",
  }).returning();

  res.status(201).json(GetContractResponse.parse(contract));
});

router.get("/contracts/:id", async (req, res): Promise<void> => {
  const params = GetContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contract] = await db.select().from(contractsTable).where(eq(contractsTable.id, params.data.id));
  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  res.json(GetContractResponse.parse(contract));
});

export default router;
