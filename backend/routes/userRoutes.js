const express = require('express');
const {
  getCurrentUser,
  listUsers,
  updateOwnProfile,
  deleteOwnProfile,
  updateUserById,
  deleteUserById,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getCurrentUser);
router.patch('/me', updateOwnProfile);
router.delete('/me', deleteOwnProfile);

router.get('/', authorize('admin'), listUsers);
router.patch('/:id', authorize('admin'), updateUserById);
router.delete('/:id', authorize('admin'), deleteUserById);

module.exports = router;
