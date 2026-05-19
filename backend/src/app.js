require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/gamification', require('./modules/gamification/gamification.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/users', require('./modules/users/users.routes'));

app.get('/health', (req, res) => {
  res.json({ status: 'Seekh Lo backend is running', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Seekh Lo backend running on http://localhost:${PORT}`);
  console.log(`CORS allowed: ${allowedOrigins.join(', ')}`);
  if (process.env.DEV_AUTO_VERIFY === 'true') {
    console.log('DEV_AUTO_VERIFY=true — new users skip email verification');
  }
});
