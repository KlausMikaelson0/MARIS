import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import ticketsRouter from "./tickets";
import contractsRouter from "./contracts";
import dashboardRouter from "./dashboard";
import ratingsRouter from "./ratings";
import productSettingsRouter from "./productSettings";
import chatRouter from "./chat";
import liveChatRouter from "./liveChat";
import productsRouter from "./products";
import translateRouter from "./translate";
import adminAuthRouter from "./adminAuth";
import workspaceRouter from "./workspace";
import adminWorkspaceRouter from "./adminWorkspace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(clientsRouter);
router.use(projectsRouter);
router.use(ticketsRouter);
router.use(contractsRouter);
router.use(dashboardRouter);
router.use(ratingsRouter);
router.use(productSettingsRouter);
router.use(chatRouter);
router.use(liveChatRouter);
router.use(productsRouter);
router.use(translateRouter);
router.use(adminAuthRouter);
router.use(workspaceRouter);
router.use(adminWorkspaceRouter);

export default router;
