// user controller file
// logic written by Sharansh Jha
// beginner level implementation
// REST API controller with proper HTTP methods and status codes

const User = require('../models/User');
const bcrypt = require('bcrypt');

// REST API to register new user
// HTTP Method: POST
// API tested using Postman
const registerUser = async (req, res) => {
    try {
        // getting data from request body
        const { name, email, password } = req.body;

        // checking if all fields are provided
        if (!name || !email || !password) {
            // sending 400 Bad Request status code
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // checking if user already exists
        const userExists = await User.findOne({ email: email });
        
        if (userExists) {
            // sending 400 status as user already exists
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // hashing password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // creating new user
        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        // sending 201 Created status code as per REST API standards
        // sending response in JSON format as REST API returns JSON data
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.log('Error in registerUser:', error.message);
        // sending 500 Internal Server Error status code
        res.status(500).json({ message: 'Server error occurred' });
    }
};

// REST API to login user
// HTTP Method: POST
// returns user data in JSON format
const loginUser = async (req, res) => {
    try {
        // getting email and password from request
        const { email, password } = req.body;

        // checking if fields are provided
        if (!email || !password) {
            // sending 400 Bad Request
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // finding user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            // sending 400 for invalid credentials
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // comparing password with hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            // password doesn't match
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // if login successful, sending 200 OK status
        // sending response in JSON format as REST API returns JSON data
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log('Error in loginUser:', error.message);
        // sending 500 Internal Server Error
        res.status(500).json({ message: 'Server error occurred' });
    }
};

// REST API to get all users
// HTTP Method: GET - used to fetch data as per REST standards
// returns array of users in JSON format
const getAllUsers = async (req, res) => {
    try {
        // fetching all users from database
        const users = await User.find({}).select('-password'); // excluding password field

        // sending 200 OK status with data
        // sending response in JSON format as REST API returns JSON data
        res.status(200).json({
            message: 'Users fetched successfully',
            count: users.length,
            users: users
        });

    } catch (error) {
        console.log('Error in getAllUsers:', error.message);
        // sending 500 Internal Server Error
        res.status(500).json({ message: 'Server error occurred' });
    }
};

// REST API to update user
// HTTP Method: PUT - used to update data as per REST standards
// takes user ID from URL params
const updateUser = async (req, res) => {
    try {
        // getting user id from params
        const userId = req.params.id;
        
        // getting updated data from body
        const { name, email } = req.body;

        // finding and updating user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name: name, email: email },
            { new: true } // this returns updated document
        ).select('-password');

        if (!updatedUser) {
            // sending 404 Not Found if user doesn't exist
            return res.status(404).json({ message: 'User not found' });
        }

        // sending 200 OK with updated data
        // sending response in JSON format as REST API returns JSON data
        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.log('Error in updateUser:', error.message);
        // sending 500 Internal Server Error
        res.status(500).json({ message: 'Server error occurred' });
    }
};

// REST API to delete user
// HTTP Method: DELETE - used to delete data as per REST standards
// takes user ID from URL params
const deleteUser = async (req, res) => {
    try {
        // getting user id from params
        const userId = req.params.id;

        // finding and deleting user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            // sending 404 Not Found if user doesn't exist
            return res.status(404).json({ message: 'User not found' });
        }

        // sending 200 OK with deleted user data
        // sending response in JSON format as REST API returns JSON data
        res.status(200).json({
            message: 'User deleted successfully',
            user: {
                id: deletedUser._id,
                name: deletedUser.name,
                email: deletedUser.email
            }
        });

    } catch (error) {
        console.log('Error in deleteUser:', error.message);
        // sending 500 Internal Server Error
        res.status(500).json({ message: 'Server error occurred' });
    }
};

// exporting all functions
module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    updateUser,
    deleteUser
};
