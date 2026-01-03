# 🚀 Rich Club eCommerce - Quick Start Guide

## ✅ Prerequisites Checklist

Before starting, ensure you have:
- ✅ Node.js (v16 or higher) installed
- ✅ MongoDB installed and running (or MongoDB Atlas account)
- ✅ npm or yarn package manager

## 📦 Installation Steps

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

## ⚙️ Environment Configuration

### Backend Setup (.env file)

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cd server
   cp .env.example .env
   ```

3. Edit the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/richclub
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

**Important Notes:**
- If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string
- Change `JWT_SECRET` to a secure random string in production
- For local MongoDB, ensure MongoDB service is running

### Frontend Setup (Optional)

1. Navigate to the `client` directory
2. Copy `.env.example` to `.env` (optional):
   ```bash
   cd client
   cp .env.example .env
   ```

## 🎯 Running the Application

### Option 1: Run Both Servers Concurrently (Recommended)

From the **root directory**:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

### Option 2: Run Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend Server:**
```bash
cd client
npm run dev
```

## 🌐 Access Points

Once both servers are running:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check Endpoint**: http://localhost:5000/api/health

## 🧪 Testing the Setup

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the Rich Club homepage
3. Scroll down to the "API Status" section
4. If everything is configured correctly, you'll see a green checkmark with "Backend Connected Successfully!"

## 🛠️ Available Scripts

### Root Directory
- `npm run dev` - Run both frontend and backend concurrently
- `npm run client` - Run frontend only
- `npm run server` - Run backend only
- `npm run install-all` - Install all dependencies (root, client, server)

### Server Directory
- `npm start` - Start server in production mode
- `npm run dev` - Start server with nodemon (auto-restart on changes)

### Client Directory
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

2. Check your `MONGO_URI` in `.env` file
3. If using MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change the port in `server/.env`:
   ```env
   PORT=5001
   ```

2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Frontend Not Connecting to Backend

**Solutions:**
1. Ensure backend is running on `http://localhost:5000`
2. Check browser console for CORS errors
3. Verify `VITE_API_URL` in `client/.env` (if created)

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
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   ├── .env             # Environment variables (create this)
│   ├── .env.example     # Environment template
│   └── server.js        # Server entry point
├── .gitignore
├── README.md
└── package.json         # Root package.json
```

## 🎨 Next Steps

Now that your boilerplate is running, you can:

1. **Add Authentication Routes**: Implement user registration and login
2. **Create Product Routes**: Build CRUD operations for products
3. **Add More Pages**: Create product listing, detail, and cart pages
4. **Implement State Management**: Add Redux or Context API
5. **Add Payment Integration**: Integrate Stripe or PayPal
6. **Deploy**: Deploy to Heroku, Vercel, or your preferred platform

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error messages in the terminal
3. Check browser console for frontend errors
4. Ensure all dependencies are installed correctly

---

**Happy Coding! 🚀**
