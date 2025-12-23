// main server file
// created by Sharansh Jha
// this project is created as part of learning backend development
// REST API backend using Express.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

// loading environment variables
dotenv.config();

// creating express app
const app = express();

// connecting to database
connectDB();

// middleware for REST API
app.use(cors()); // allowing cross-origin requests for REST API
app.use(express.json()); // parsing json data - REST APIs use JSON format
app.use(express.urlencoded({ extended: true })); // parsing form data

// simple route for testing API
app.get('/', (req, res) => {
    res.json({ 
        message: 'User Authentication REST API is running',
        version: 'v1',
        author: 'Sharansh Jha'
    });
});

// REST API routes with versioning
// api versioning added for learning REST API structure
app.use('/api/v1/users', userRoutes);

// setting port
const PORT = process.env.PORT || 3000;

// starting server
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`REST API Server running on port ${PORT}`);
    console.log('API Version: v1');
    console.log('Created by: Sharansh Jha');
    console.log('=================================');
});
