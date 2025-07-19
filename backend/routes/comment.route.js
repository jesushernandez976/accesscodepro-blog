import express from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/comment.controller.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";

const router = express.Router();

router.get("/:postId", getPostComments);
router.post("/:postId", requireAuth(), addComment);        
router.delete("/:id", requireAuth(), deleteComment);    


export default router 