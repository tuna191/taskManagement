import express from 'express';
import { createAccessCode, validateAccessCode, createEmployee, deleteEmployee ,testconnectFirebase,getEmployee} from '../controllers/ownerController.js';

const router = express.Router();

router.post('/create-access-code', createAccessCode);
router.post('/validate-access-code', validateAccessCode);
router.post('/create-employee', createEmployee);
router.post('/get-employee', getEmployee);

router.post('/delete-employee', deleteEmployee);
router.get('/test', testconnectFirebase);



export default router;