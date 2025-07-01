# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [1.0.0] - 2025-01-27

### Added
- User registration and authentication system
- JWT-based authentication with cookies
- Password encryption using bcrypt
- User login and logout functionality
- User profile management
- File upload functionality with Multer
- EJS templating for responsive UI
- MongoDB integration with Mongoose
- Express.js server setup
- User models (user.js, appuser.js)
- Authentication middleware
- User routes and controllers
- Static file serving for uploads
- Environment variable support with dotenv
- Project documentation (README.md)
- Git repository initialization

### Features
- User registration with validation
- Secure login system
- Profile image upload
- Protected routes
- Session management
- Responsive web interface

### Technical Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **Templating**: EJS
- **Environment**: dotenv
- **Development**: nodemon

### File Structure
- `/controller` - Route controllers
- `/middleware` - Authentication middleware
- `/models` - Database models
- `/Router` - Route definitions
- `/views` - EJS templates
- `/public/uploads` - User uploaded files

## [0.1.0] - Initial Development

### Added
- Project initialization
- Basic folder structure
- Development environment setup 