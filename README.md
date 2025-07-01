# User Module - MERN Stack Application

A full-stack web application built with Node.js, Express, MongoDB, and EJS templating for user management and authentication.

## Features

- User registration and authentication
- JWT-based authentication with cookies
- Password encryption using bcrypt
- File upload functionality with Multer
- User profile management
- Responsive UI with EJS templates

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcrypt
- **File Upload**: Multer
- **Templating**: EJS
- **Other**: Cookie Parser, dotenv

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd usermodule
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   JWT_SECRET=your_jwt_secret_here
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Start the application:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

```
usermodule/
├── app.js                 # Main application file
├── controller/            # Route controllers
├── middleware/            # Custom middleware (auth)
├── models/                # Database models
├── Router/                # Route definitions
├── views/                 # EJS templates
├── public/                # Static files and uploads
└── package.json           # Dependencies and scripts
```

## API Endpoints

- User registration and login
- User profile management
- File upload functionality
- Protected routes with JWT authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC 