# User Authentication & Management System

**Created by: Sharansh Jha (B.Tech CSE Student)**

This project is created for learning backend development and REST APIs.

## 📌 Project Description

A simple full-stack web application that demonstrates user authentication and CRUD operations using **RESTful API architecture**. The backend is built with Node.js, Express, and MongoDB following REST API principles, while the frontend uses HTML, Tailwind CSS, and vanilla JavaScript to consume the REST APIs.

## 🌐 REST API Usage

This project is built using **RESTful APIs** following proper HTTP methods (GET, POST, PUT, DELETE) and JSON-based request-response structure.

### REST API Principles Implemented:
- ✅ **Resource-based URLs** - `/api/v1/users`
- ✅ **HTTP Methods** - GET (read), POST (create), PUT (update), DELETE (delete)
- ✅ **JSON Format** - All requests and responses use JSON
- ✅ **Proper Status Codes** - 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Server Error
- ✅ **API Versioning** - `/api/v1/` for future compatibility
- ✅ **Stateless Communication** - Each request is independent

## ✨ Features

- **User Registration** - Create new user accounts with name, email, and password
- **User Login** - Authenticate users with email and password
- **View All Users** - Display all registered users in a table
- **Update User** - Edit user information (name and email)
- **Delete User** - Remove users from the database
- **Password Hashing** - Secure password storage using bcrypt
- **Responsive UI** - Clean and modern interface using Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt (for password hashing)
- CORS (for cross-origin requests)

### Frontend
- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Fetch API

## 📁 Project Structure

```
user-auth-management/
│
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── userRoutes.js
│   ├── controllers/
│   │   └── userController.js
│   ├── config/
│   │   └── db.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── register.html
│   ├── login.html
│   └── users.html
│
└── README.md
```

## 🚀 How to Run Locally

### Prerequisites
- Node.js installed on your system
- MongoDB installed and running locally

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
npm start
```

The REST API server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Open any HTML file in your browser:
   - `register.html` - To create a new account
   - `login.html` - To login
   - `users.html` - To view all users

Or you can use Live Server extension in VS Code to run the frontend.

## 📡 REST API Endpoints

All endpoints follow REST API standards with proper HTTP methods and JSON responses.

| HTTP Method | Endpoint | Description | Status Codes |
|-------------|----------|-------------|--------------|
| POST | `/api/v1/users/register` | Register a new user | 201, 400, 500 |
| POST | `/api/v1/users/login` | Login user | 200, 400, 500 |
| GET | `/api/v1/users` | Get all users | 200, 500 |
| PUT | `/api/v1/users/:id` | Update user by ID | 200, 404, 500 |
| DELETE | `/api/v1/users/:id` | Delete user by ID | 200, 404, 500 |

### REST API Features:
- **Versioned URLs** - `/api/v1/` prefix for all endpoints
- **JSON Responses** - All responses in JSON format
- **HTTP Status Codes** - Proper status codes for each operation
- **CRUD Operations** - Complete Create, Read, Update, Delete functionality

## 📝 REST API Testing with Postman

You can test the REST APIs using Postman. All endpoints use JSON format.

### Register User (POST)
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/users/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```
- **Success Response:** 201 Created

### Login User (POST)
- **Method:** POST
- **URL:** `http://localhost:3000/api/v1/users/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Success Response:** 200 OK

### Get All Users (GET)
- **Method:** GET
- **URL:** `http://localhost:3000/api/v1/users`
- **Success Response:** 200 OK

### Update User (PUT)
- **Method:** PUT
- **URL:** `http://localhost:3000/api/v1/users/{user_id}`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```
- **Success Response:** 200 OK
- **Error Response:** 404 Not Found

### Delete User (DELETE)
- **Method:** DELETE
- **URL:** `http://localhost:3000/api/v1/users/{user_id}`
- **Success Response:** 200 OK
- **Error Response:** 404 Not Found

## 🎓 Learning Outcomes

Through this project, I learned:
- **Building REST APIs** with Express.js following REST principles
- **HTTP Methods** - GET, POST, PUT, DELETE for different operations
- **HTTP Status Codes** - 200, 201, 400, 404, 500 for proper responses
- **JSON Format** - Request and response handling in JSON
- **API Versioning** - Using `/api/v1/` for future compatibility
- **Database operations** with MongoDB and Mongoose
- **Password hashing** and basic security with bcrypt
- **Frontend-backend integration** using fetch API
- **CRUD operations** - Create, Read, Update, Delete
- **Asynchronous JavaScript** (async/await)
- **Error handling** in Node.js
- **Client-Server communication** using REST APIs
- **API testing** with Postman

This project helped me understand **REST APIs, backend routing, and client-server communication** in a practical way.

## 📌 Notes

- This is a beginner-level project for learning purposes
- Not intended for production use
- Basic security implementation (no JWT, no advanced authentication)
- Simple and readable code structure

## 👨‍💻 Author

**Sharansh Jha**  
B.Tech CSE Student  
Learning Backend Development

---

*This project is created as part of learning backend development and understanding how REST APIs work.*
