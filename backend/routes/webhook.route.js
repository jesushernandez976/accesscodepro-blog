import express from "express";
import { clerkWebHook } from "../controllers/webhook.controller.js";
import bodyParser from "body-parser";

const router = express.Router();

router.post("/webhooks/clerk", clerkWebHook);


export default router;
