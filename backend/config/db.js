// database connection file
// written by Sharansh Jha
// simple mongoose connection for learning purpose

const mongoose = require('mongoose');

// function to connect to mongodb
const connectDB = async () => {
    try {
        // connecting to database
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log('MongoDB Connected Successfully');
        console.log('Database Host:', conn.connection.host);
    } catch (error) {
        // if connection fails
        console.log('Error connecting to MongoDB:', error.message);
        process.exit(1); // exit with failure
    }
};

module.exports = connectDB;
