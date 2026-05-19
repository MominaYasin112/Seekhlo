require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Seekh Lo backend running on http://localhost:${PORT}`);
});