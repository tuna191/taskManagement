import express from "express";
import { getSidebarUsers,sendMessage,getMessages } from "../controllers/messagesController.js";

const router = express.Router();

router.post("/getSidebarUsers", getSidebarUsers);
router.post("/send", sendMessage);
router.post("/getMessage", getMessages);


export default router;