import express from 'express';
import { newTask, getTasks, getAllTasks } from '../controllers/Tasks.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/', isAuthenticated, isAdmin, newTask);
router.get('/:user_id', isAuthenticated, getTasks);
router.get('/', isAuthenticated, getAllTasks);

export default router;
