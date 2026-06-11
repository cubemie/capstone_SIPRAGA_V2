require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const path          = require('path');
const morgan        = require('morgan');
const swaggerUi     = require('swagger-ui-express');
const swaggerSpecs  = require('./config/swagger');
const errorHandler  = require('./middlewares/errorHandler');
const helmet        = require('helmet');
const rateLimit     = require('express-rate-limit');

const app = express();

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const suratRoutes         = require('./routes/suratRoutes');
const wargaRoutes         = require('./routes/wargaRoutes');
const superadminRoutes    = require('./routes/superAdminRoutes');
const templateSuratRoutes = require('./routes/templateSuratRoutes');
const ttdRtRwRoutes       = require('./routes/ttdRtRwRoutes');

// ─── Middleware Global ────────────────────────────────────────────────────────

// HTTP request logger — tampilkan log setiap request di terminal
// dev mode: warna + method + URL + status + response time
// production: combined format (IP + user-agent, cocok untuk log file)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(helmet());

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Terlalu banyak request. Coba lagi nanti.' }
}));

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(url => url.trim());

app.use(cors({
  origin: allowedOrigins,
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

const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { status: 'error', message: 'Terlalu banyak request login/register. Coba lagi nanti.' } 
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/surat',          suratRoutes);
app.use('/api/warga',          wargaRoutes);
app.use('/api/ttd',            ttdRtRwRoutes);
app.use('/api/superadmin',     superadminRoutes);
app.use('/api/template-surat', templateSuratRoutes);

// ─── Swagger Documentation ────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ─── Global Error Handler — HARUS PALING AKHIR ───────────────────────────────
app.use(errorHandler);

module.exports = app;
