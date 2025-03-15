# Library Management System Frontend

This is the frontend application for the Library Management System, built with React and Material-UI.

## Features

- User authentication (login/register)
- Dashboard with statistics and recent activities
- Book management (add, edit, delete, search)
- Member management (add, edit, delete, search)
- Borrowing management (borrow books, return books, track due dates)
- Responsive design for all devices

## Technologies Used

- React 18
- React Router v6
- Material-UI v5
- Axios for API requests
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

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

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
frontend/
├── public/                 # Public assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable components
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── App.js              # Main App component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
└── package.json            # Dependencies and scripts
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests
- `npm eject` - Ejects from Create React App

## Backend API

The frontend communicates with the backend API running at `http://localhost:8080`. The proxy is configured in `package.json`.

## Authentication

The application uses JWT tokens for authentication. The token is stored in localStorage and included in the Authorization header for API requests.

## License

This project is licensed under the MIT License. 