import { Router, type IRouter } from "express";
import { db, leadsTable, clientsTable, projectsTable, ticketsTable, contractsTable, portfolioTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { GetDashboardSummaryResponse, ListPortfolioResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const [totalLeadsResult] = await db.select({ count: count() }).from(leadsTable);
  const [totalClientsResult] = await db.select({ count: count() }).from(clientsTable);
  const [signedContractsResult] = await db.select({ count: count() }).from(contractsTable).where(eq(contractsTable.status, "signed"));

  const activeProjects = await db.select({ count: count() }).from(projectsTable)
    .where(eq(projectsTable.status, "in_progress"));
  const deliveredProjects = await db.select({ count: count() }).from(projectsTable)
    .where(eq(projectsTable.status, "delivered"));
  const openTickets = await db.select({ count: count() }).from(ticketsTable)
    .where(eq(ticketsTable.status, "pending"));

  const summary = {
    totalLeads: Number(totalLeadsResult?.count ?? 0),
    activeProjects: Number(activeProjects[0]?.count ?? 0),
    deliveredProjects: Number(deliveredProjects[0]?.count ?? 0),
    openTickets: Number(openTickets[0]?.count ?? 0),
    totalClients: Number(totalClientsResult?.count ?? 0),
    signedContracts: Number(signedContractsResult?.count ?? 0),
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/portfolio", async (req, res): Promise<void> => {
  const items = await db.select().from(portfolioTable).orderBy(portfolioTable.id);
  res.json(ListPortfolioResponse.parse(items));
});

export default router;
