# Headout Server

A Node.js backend server built with Express and TypeScript, providing API endpoints for the Headout application.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Other Key Libraries**:
  - cors (Cross-Origin Resource Sharing)
  - cookie-parser (Cookie handling)
  - dotenv (Environment variables)
  - canvas (Image processing)

## 📁 Project Structure

```
src/
├── app.ts              # Application entry point
├── config.ts           # Configuration settings
├── seed.ts             # Database seeding script
├── controllers/        # Request handlers
├── routes/            # API route definitions
├── models/            # Database models
├── services/          # Business logic
└── interceptors/      # Middleware functions
```

## 🛠️ Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.sample` to `.env`
   - Update the environment variables as needed

4. **Database Seeding** (optional)
   ```bash
   npm run seed
   ```

## 🚀 Available Scripts

- `npm run start:dev` - Start development server with hot-reload
- `npm run build` - Build the project
- `npm run start` - Start production server
- `npm run build:prod` - Clean and build for production
- `npm run clean` - Clean build directory
- `npm run seed` - Run database seeding script

## 🔧 Development

To start the development server:

```bash
npm run start:dev
```

The server will restart automatically when you make changes to the source code.

## 📦 Production Build

To create a production build:

```bash
npm run build:prod
```

To start the production server:

```bash
npm run start
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=<your-port>
MONGODB_URI=<your-mongodb-connection-string>
# Add other environment variables as needed
```

## 📝 API Documentation

### User Endpoints
#### `POST /api/users`
- **Description**: Create a new user
- **Request Body**: User details
- **Response**: Created user object

#### `GET /api/users/me`
- **Description**: Get current user's profile
- **Authentication**: Required
- **Response**: Current user's details

#### `GET /api/users/:id`
- **Description**: Get user by ID
- **Parameters**: 
  - `id`: User ID
- **Response**: User details

### City Endpoints
#### `GET /api/cities/randomCity`
- **Description**: Get a random city
- **Response**: Random city details

#### `POST /api/cities/validate`
- **Description**: Validate city information
- **Request Body**: City validation data
- **Response**: Validation result

### Share Image Endpoints
#### `GET /api/share-image`
- **Description**: Generate and share image
- **Query Parameters**: Image generation parameters
- **Response**: Generated image or image URL

### Response Formats
All API endpoints return responses in JSON format unless specified otherwise (like image endpoints).

### Error Handling
The API uses standard HTTP response codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

### Authentication
Some endpoints may require authentication. Include the authentication token in the request header:
```http
Authorization: Bearer <your-token>
```

### Rate Limiting
[Add rate limiting details if implemented]

### API Versioning
Current API version: v1
Base URL: `/api`
