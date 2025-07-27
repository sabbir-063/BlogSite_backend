# Blog Site Backend

This is the backend server for the Blog Site application, built with Node.js, Express, and MongoDB. It provides RESTful APIs for user authentication, blog post management, and user profile operations.

## Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Project Structure

```
backend/
├── Controllers/
│   ├── authController.js    # Authentication related controllers
│   ├── postController.js    # Blog post related controllers
│   └── userController.js    # User profile related controllers
├── DB/
│   └── dbConnect.js         # Database connection configuration
├── Middleware/
│   ├── authMiddleware.js    # JWT authentication middleware
│   ├── postImageUpload.js   # Image upload middleware for posts
│   └── upload.js           # General file upload configuration
├── Models/
│   ├── Post.js             # Blog post schema
│   └── userSchema.js       # User schema
├── Routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── postRoutes.js       # Blog post routes
│   └── userRoutes.js       # User profile routes
├── uploads/                # Directory for uploaded files
├── index.js               # Server entry point
└── package.json          # Project dependencies and scripts
```

## Features

- User authentication (signup, login, logout)
- JWT-based authorization
- Blog post CRUD operations
- Image upload functionality
- User profile management
- Input validation using Joi
- Password hashing using bcrypt

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Blog Posts
- GET `/api/posts` - Get all posts
- GET `/api/posts/:id` - Get single post
- POST `/api/posts` - Create new post
- PUT `/api/posts/:id` - Update post
- DELETE `/api/posts/:id` - Delete post

### User Profile
- GET `/api/user/profile` - Get user profile
- PUT `/api/user/profile` - Update user profile

## Installation

1. Clone the repository
```bash
git clone https://github.com/sabbir-063/BlogSite_backend.git
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables as described above

4. Start the server:
```bash
npm start
```

The server will start on the configured port (default: 8080)

## Dependencies

- express - Web framework
- mongoose - MongoDB object modeling
- bcrypt - Password hashing
- jsonwebtoken - JWT implementation
- multer - File upload handling
- cors - Cross-origin resource sharing
- dotenv - Environment variable management
- joi - Input validation
- nodemon - Development server

## Development

To run the server in development mode with auto-reload:
```bash
npm start
```

## Error Handling

The application includes comprehensive error handling for:
- Invalid requests
- Authentication errors
- Database errors
- File upload errors
- Validation errors

## Security Features

- Password hashing
- JWT-based authentication
- Input validation
- File upload restrictions
- CORS configuration
