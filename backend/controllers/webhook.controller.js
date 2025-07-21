import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  console.log("Webhook payload received.");
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  console.log("Webhook secret exists:", !!WEBHOOK_SECRET);

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is missing!");
    return res.status(500).json({ message: "Webhook secret needed!" });
  }

  const payload = req.body;
  const headers = req.headers;

  console.log("Headers:", headers);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  
  try {
    evt = wh.verify(payload, headers);
    console.log("Webhook verified successfully");
    console.log("Event type:", evt.type);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ message: "Webhook verification failed!" });
  }

  try {
    if (evt.type === "user.created") {
      console.log("Creating new user:", evt.data.id);
      
      const newUser = new User({
        clerkUserId: evt.data.id,
        username: evt.data.username || evt.data.email_addresses[0]?.email_address,
        email: evt.data.email_addresses[0]?.email_address,
        img: evt.data.profile_img_url,
      });

      const savedUser = await newUser.save();
      console.log("User saved successfully:", savedUser._id);
    }

    if (evt.type === "user.deleted") {
      console.log("Deleting user:", evt.data.id);
      
      const deletedUser = await User.findOneAndDelete({
        clerkUserId: evt.data.id,
      });

      if (deletedUser) {
        await Post.deleteMany({ user: deletedUser._id });
        await Comment.deleteMany({ user: deletedUser._id });
        console.log("User and related data deleted successfully");
      }
    }

    return res.status(200).json({ message: "Webhook processed successfully" });
    
  } catch (error) {
    console.error("Database operation failed:", error);
    return res.status(500).json({ message: "Database operation failed", error: error.message });
  }
};