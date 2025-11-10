import express from 'express';
import { 
  getAllUsers,
  getUserById, 
  registerUser, 
  loginUser, 
  updateUser, 
  deleteUser 
} from '../controllers/usersController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// === GET ALL USERS ===
router.get('/', getAllUsers);

// === GET SINGLE USER BY ID ===
router.get('/:id', getUserById);

// === REGISTER ===
router.post('/register', registerUser);

// === LOGIN ===
router.post('/login', loginUser);

// === UPDATE USER ===
router.put('/update/:id', authenticate, updateUser);

// === DELETE USER ===
router.delete('/delete/:id', authenticate, deleteUser);

export default router;
