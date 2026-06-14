const express           = require('express');
const router            = express.Router();
const authController    = require('../controllers/authController');
const { verifyToken }   = require('../middlewares/authMiddleware');
const requireSuperadmin = require('../middlewares/superAdminMiddleware');
const sa                = require('../controllers/superAdminController');
const auditLogger       = require('../middlewares/auditLogger');

const guard = [verifyToken, requireSuperadmin, auditLogger];

// ─── Auth Superadmin ─────────────────────────────────────────────────────────
router.post('/register', authController.registerSuperadmin);
router.post('/login',    authController.loginSuperadmin);

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/dashboard',     ...guard, sa.getDashboardStats);
router.get('/dashboard-stats', ...guard, sa.getDashboardStats);
router.get('/stats/warga/:rw_id', ...guard, sa.getWargaStats);
router.get('/warga-stats/:rw_id', ...guard, sa.getWargaStats);

// ─── Legacy (lama) ───────────────────────────────────────────────────────────
router.post('/rt',   verifyToken, requireSuperadmin, authController.insertRt);
router.post('/rw',   verifyToken, requireSuperadmin, authController.insertRw);
router.get('/stats', verifyToken, requireSuperadmin, authController.getStats);

// ─── Manajemen Akun RT/RW ────────────────────────────────────────────────────
router.get('/rt',                    ...guard, sa.listRT);
router.get('/rw',                    ...guard, sa.listRW);
router.delete('/users/:role/:id',    ...guard, sa.deleteUser);
router.patch('/users/:role/:id/reset-password', ...guard, sa.resetPassword);
router.patch('/users/:role/:id/toggle-active',  ...guard, sa.toggleActive);

// ─── Konfigurasi Instansi ────────────────────────────────────────────────────
router.get('/config',         ...guard, sa.getConfig);
router.put('/config',         ...guard, sa.updateConfig);

// ─── Log Sistem / Audit Trail ────────────────────────────────────────────────
router.get('/logs',           ...guard, sa.getLogs);

// ─── Manajemen Template Markdown ─────────────────────────────────────────────
router.get('/templates',           ...guard, sa.listMarkdownTemplates);
router.post('/templates',          ...guard, sa.createMarkdownTemplate);
router.put('/templates/:id',       ...guard, sa.updateMarkdownTemplate);
router.delete('/templates/:id',    ...guard, sa.deleteMarkdownTemplate);
router.get('/templates/:id/preview', ...guard, sa.previewMarkdownTemplate);

module.exports = router;
