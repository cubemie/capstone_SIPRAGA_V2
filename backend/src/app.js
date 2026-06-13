require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const path          = require('path');
const morgan        = require('morgan');
const swaggerUi     = require('swagger-ui-express');
const swaggerSpecs  = require('./config/swagger');
const errorHandler  = require('./middlewares/errorHandler');

const app = express();

// ─── Import Routes ────────────────────────────────────────────────────────────
const lettersRoutes = require('./modules/letters/letters.routes');
const publicRoutes  = require('./modules/public/public.routes');
const authRoutes          = require('./routes/authRoutes');
const suratRoutes         = require('./routes/suratRoutes');
const wargaRoutes         = require('./routes/wargaRoutes');
const authRtRwRoutes      = require('./routes/authRtRwRoutes');
const dashboardRtRwRoutes = require('./routes/dashboardRtRwRoutes');
const superadminRoutes    = require('./routes/superAdminRoutes');
const templateSuratRoutes = require('./routes/templateSuratRoutes');
const ttdRtRwRoutes       = require('./routes/ttdRtRwRoutes');
const notificationRoutes  = require('./routes/notificationRoutes');

// ─── Middleware Global ────────────────────────────────────────────────────────

// HTTP request logger — tampilkan log setiap request di terminal
app.use((req, res, next) => {
  console.log(`[GLOBAL LOG] ${req.method} ${req.url}`);
  next();
});
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin:         process.env.CLIENT_URL || 'http://localhost:5173',
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk semua file upload
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running normally.' });
});

app.use('/api/auth',           authRoutes);
app.use('/api/auth',           authRtRwRoutes);     // alias mundur /api/auth/login-rt-rw
app.use('/api/surat',          suratRoutes);
app.use('/api/warga',          wargaRoutes);
app.use('/api/ttd',            ttdRtRwRoutes);
app.use('/api',                dashboardRtRwRoutes);
app.use('/api/superadmin',     superadminRoutes);
app.use('/api/template-surat', templateSuratRoutes);

// V2 Route
app.use('/api/v2/letters', lettersRoutes);
app.use('/api/v2/public', publicRoutes);

app.use('/api/notifications', notificationRoutes);


// ─── Swagger Documentation ────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global Error Handler — HARUS PALING AKHIR ───────────────────────────────
app.use(errorHandler);

module.exports = app;
