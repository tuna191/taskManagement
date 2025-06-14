import express from "express";
import { addTask,deleteTask,markTask,getTask } from "../controllers/taskController.js";

const router = express.Router();

router.post("/addTask", addTask);
router.post("/deleteTask", deleteTask);
router.post("/markTask", markTask);
router.post("/getTask", getTask);




export default router;