import { Router, type IRouter } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  GetProjectResponse,
  UpdateProjectParams,
  UpdateProjectResponse,
  ListProjectsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(ListProjectsResponse.parse(projects));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db.insert(projectsTable).values({
    clientId: parsed.data.clientId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    storeUrl: parsed.data.storeUrl ?? null,
    previewDesktopUrl: parsed.data.previewDesktopUrl ?? null,
    previewMobileUrl: parsed.data.previewMobileUrl ?? null,
    status: parsed.data.status,
    category: parsed.data.category ?? null,
  }).returning();

  res.status(201).json(GetProjectResponse.parse(project));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse(project));
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title != null) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.storeUrl !== undefined) updateData.storeUrl = parsed.data.storeUrl;
  if (parsed.data.previewDesktopUrl !== undefined) updateData.previewDesktopUrl = parsed.data.previewDesktopUrl;
  if (parsed.data.previewMobileUrl !== undefined) updateData.previewMobileUrl = parsed.data.previewMobileUrl;
  if (parsed.data.status != null) updateData.status = parsed.data.status;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.deliveredAt !== undefined) updateData.deliveredAt = parsed.data.deliveredAt ? new Date(parsed.data.deliveredAt) : null;

  const [project] = await db
    .update(projectsTable)
    .set(updateData)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(UpdateProjectResponse.parse(project));
});

export default router;
