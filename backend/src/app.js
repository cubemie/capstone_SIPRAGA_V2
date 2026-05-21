require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const authRoutes = require('./routes/authRoutes');
const suratRoutes = require('./routes/suratRoutes');
const wargaRoutes = require('./routes/wargaRoutes');
const authRtRwRoutes = require('./routes/authRtRwRoutes');
const dashboardRtRwRoutes = require('./routes/dashboardRtRwRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const templateSuratRouter = require('./routes/templateSuratRoutes');

// CORS — izinkan request dari frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk file upload
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surat', suratRoutes);
app.use('/api/warga', wargaRoutes);
app.use('/api/auth', authRtRwRoutes);
app.use('/api', dashboardRtRwRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/template-surat', templateSuratRouter);

module.exports = app;
