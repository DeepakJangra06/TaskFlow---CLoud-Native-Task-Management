const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// K8s Probes
app.get('/healthz', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('Service Unavailable');
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

if (process.env.NODE_ENV !== 'test') {
  const server = mongoose
    .connect(MONGODB_URI)
    .then(() => {
      return app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => console.log(err));

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      const s = await server;
      s.close(() => {
        console.log('Http server closed.');
        process.exit(0);
      });
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;