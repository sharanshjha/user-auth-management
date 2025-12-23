// user routes file
// created by Sharansh Jha
// REST API routing for learning purpose
// backend logic written while learning REST

const express = require('express');
const router = express.Router();

// importing controller functions
const {
    registerUser,
    loginUser,
    getAllUsers,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// defining REST API routes
// following REST principles with proper HTTP methods

// REST API endpoint to register a new user
// using POST method as per REST principles
// POST /api/v1/users/register
router.post('/register', registerUser);

// REST API endpoint to login user
// using POST method for authentication
// POST /api/v1/users/login
router.post('/login', loginUser);

// REST API endpoint to get all users
// using GET method to fetch data as per REST standards
// GET /api/v1/users
router.get('/', getAllUsers);

// REST API endpoint to update user by ID
// using PUT method to update data as per REST standards
// PUT /api/v1/users/:id
router.put('/:id', updateUser);

// REST API endpoint to delete user by ID
// using DELETE method as per REST standards
// DELETE /api/v1/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
