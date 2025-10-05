import express from 'express';
import {
  getCustomerController,
  getAllCustomersController,
  addCustomerController,
  deleteCustomerController,
  updateCustomerController,
} from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getAllCustomersController);
router.get('/:id', authMiddleware, getCustomerController);
router.post('/', authMiddleware, addCustomerController);
router.delete('/:id', authMiddleware, deleteCustomerController);
router.put('/:id', authMiddleware, updateCustomerController);

export default router;
