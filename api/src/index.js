// This makes the crypto module available globally, which can resolve issues
// with some libraries (like @azure/storage-blob) that expect it in the global scope.
global.crypto = require('crypto');
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { setupContainer } = require('./helpers/azureBlobStorage');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Initialize Redis client and store
// The URL points to the 'redis' service in your docker-compose.yml
const redisUrl = process.env.REDIS_URL;
const redisClient = createClient({ url: redisUrl });
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'photosess:', // A prefix for session keys in Redis
});

const app = express();

// Middleware
app.use(morgan('dev'));

const normalize = (v) => (v ? v.trim().replace(/\/$/, '') : v);

const allowedOrigins = [
  'http://localhost:5173',
  'https://photoshaareweb.z1.web.core.windows.net',
  normalize(process.env.CLIENT_URL),
].filter(Boolean);

console.log('CORS allowedOrigins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / server-to-server

    const o = normalize(origin);

    if (allowedOrigins.includes(o)) return callback(null, true);

    console.log('CORS blocked origin:', origin);
    return callback(null, false);
  },
  credentials: true,
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Don't create session until something is stored
  cookie: {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: true,
    sameSite: 'none',  // Use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24 // Expires in 1 day
  }
}));

const authRoutes = require('./routes/authRoutes');
const mediaRoutes = require('./routes/media');
const userRoutes = require('./routes/users')
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Photo-Share API is running!');
});




const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await setupContainer();
  // Only listen on a port if not in a test environment
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
};

startServer();

module.exports = app; // Export the app for testing
