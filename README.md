# Rich Club eCommerce Platform

A modern, production-ready MERN stack eCommerce application.

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT

## 📁 Project Structure

```
Rich Club(Website)/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── styles/        # Global styles
│   │   ├── utils/         # Utility functions
│   │   └── main.jsx       # Application entry point
│   └── package.json
├── server/                # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middlewares/      # Custom middlewares
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── server.js         # Server entry point
└── package.json          # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Rich Club(Website)"
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Backend server port (default: 5000)

### Running the Application

#### Option 1: Run Both Concurrently (Recommended)
```bash
# From the root directory
npm run dev
```

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📝 Available Scripts

### Root Directory
- `npm run dev` - Run both frontend and backend concurrently
- `npm run client` - Run frontend only
- `npm run server` - Run backend only

### Client Directory
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server Directory
- `npm run dev` - Start server with nodemon
- `npm start` - Start server in production mode

## 🔒 Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/richclub
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Team Name

## 🙏 Acknowledgments

- Built with MERN Stack
- Powered by Vite for blazing fast development
