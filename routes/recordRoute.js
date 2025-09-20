import express from 'express';
import { insertRecord, getRecords, loginUser, updateRecord, getprofile } from '../controllers/Record.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/', isAuthenticated, isAdmin, insertRecord);
router.put('/:user_id', isAuthenticated, updateRecord);
router.put('/', isAuthenticated, updateRecord);
router.get('/', isAuthenticated, getRecords);
router.post('/login', loginUser);
router.get('/profile/:user_id', isAuthenticated, getprofile);

export default router;
