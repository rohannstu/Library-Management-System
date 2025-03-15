# Library Management System

A comprehensive library management system built with Spring Boot and React.

## Features

- User authentication and authorization (Admin and User roles)
- Book management (add, edit, delete, search)
- Member management (add, edit, delete, search)
- Borrowing management (borrow, return, track overdue)
- Dashboard with statistics

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.3
- Spring Security with JWT authentication
- Spring Data JPA
- H2 Database (in-memory)

### Frontend
- React
- Material-UI
- React Router
- Axios

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 14 or higher
- npm or yarn

### Running the Backend

1. Navigate to the project root directory
2. Run the Spring Boot application:
   ```
   mvn spring-boot:run
   ```
3. The backend will start on http://localhost:8080
4. H2 Console is available at http://localhost:8080/h2-console
   - JDBC URL: jdbc:h2:mem:librarydb
   - Username: sa
   - Password: (leave empty)

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```
4. The frontend will start on http://localhost:3000

## API Endpoints

### Authentication
- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login and get JWT token

### Books
- GET /api/books - Get all books
- GET /api/books/{id} - Get book by ID
- POST /api/books - Add a new book
- PUT /api/books/{id} - Update a book
- DELETE /api/books/{id} - Delete a book

### Members
- GET /api/members - Get all members
- GET /api/members/{id} - Get member by ID
- POST /api/members - Add a new member
- PUT /api/members/{id} - Update a member
- DELETE /api/members/{id} - Delete a member

### Borrowings
- GET /api/borrowings - Get all borrowings
- GET /api/borrowings/{id} - Get borrowing by ID
- POST /api/borrowings - Add a new borrowing
- PUT /api/borrowings/{id} - Update a borrowing
- PUT /api/borrowings/{id}/return - Return a book
- DELETE /api/borrowings/{id} - Delete a borrowing
- GET /api/borrowings/active - Get active borrowings
- GET /api/borrowings/overdue - Get overdue borrowings

## User Roles

### Regular User
- Can borrow books
- View the catalog
- Manage personal borrowings

### Administrator
- Has all user permissions
- Add, edit, and delete books
- Manage members
- Handle all borrowing operations

## Project Structure

```
library-management-system/
├── src/                    # Backend source code
│   ├── main/
│   │   ├── java/           # Java code
│   │   └── resources/      # Configuration files
│   └── test/               # Test code
├── frontend/               # Frontend React application
├── pom.xml                 # Maven configuration
└── README.md               # This file
```

## License

This project is licensed under the MIT License. 

# Library-Management-System
# Library-Management-System
