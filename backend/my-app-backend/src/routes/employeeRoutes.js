import express from 'express';
import { verifyToken, completeSetup,loginEmployee,getEmployees } from '../controllers/employeeController.js';

const router = express.Router();
router.post('/verify-token', verifyToken);
router.post('/complete-setup', completeSetup);
router.post("/login-employee", loginEmployee);
router.post("/getEmployees", getEmployees);

export default router;