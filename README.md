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
│   ├── authController.js      # Authentication related controllers
│   ├── contactController.js   # Contact form controllers
│   ├── passwordController.js  # Password reset/recovery controllers
│   ├── postController.js      # Blog post related controllers
│   └── userController.js      # User profile related controllers
├── DB/
│   └── dbConnect.js           # Database connection configuration
├── Middleware/
│   ├── authMiddleware.js      # JWT authentication middleware
│   ├── cloudinaryUpload.js    # Cloudinary integration for image storage
│   ├── postImageUpload.js     # Image upload middleware for posts
│   └── upload.js             # General file upload configuration
├── Models/
│   ├── Post.js               # Blog post schema with text indexing
│   └── userSchema.js         # User schema
├── Routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── contactRoutes.js      # Contact form routes
│   ├── postRoutes.js         # Blog post routes
│   └── userRoutes.js         # User profile routes
├── utils/
│   └── cloudinary.js         # Cloudinary configuration
├── uploads/                  # Directory for uploaded files
│   └── post-images/          # Blog post images
├── index.js                 # Server entry point
└── package.json            # Project dependencies and scripts
```

## Features

- User authentication (signup, login, logout)
- JWT-based authorization
- Blog post CRUD operations
- Image upload functionality
- User profile management
- Password hashing using bcrypt
- Advanced search functionality with MongoDB text indexes
- Post sorting by date, views, and likes
- Post filtering by tags and categories
- Pagination for optimized performance
- Post engagement tracking (views, likes)
- Markdown content support

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user

### Blog Posts
- GET `/api/posts` - Get all posts with sorting, filtering, and pagination
- GET `/api/posts/search` - Search posts by title, content, or tags
- GET `/api/posts/:id` - Get single post
- POST `/api/posts` - Create new post with Markdown content
- PUT `/api/posts/:id` - Update post
- DELETE `/api/posts/:id` - Delete post
- POST `/api/posts/:id/like` - Like/unlike a post
- POST `/api/posts/:id/comment` - Add comment to post

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
- cloudinary - Cloud storage for images
- cors - Cross-origin resource sharing
- dotenv - Environment variable management
- nodemon - Development server
- express-validator - Input validation

## Search and Filter Features

The backend now supports advanced search and filtering capabilities:
- Full-text search across post title, content and tags
- MongoDB text indexes for efficient searching
- Multiple sort options (newest, oldest, most viewed, most liked)
- Filtering by post tags or categories
- Pagination with customizable limit and page parameters
- Combined filters for complex queries


