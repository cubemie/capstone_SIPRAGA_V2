// backend/src/controllers/notificationController.js
const pool = require('../config/db');
const NotificationService = require('../services/NotificationService');

// Ambil notifikasi untuk user yang login (warga, rt, atau rw)
const getNotifications = async (req, res) => {
  try {
    const { recipientId, recipientRole } = NotificationService.resolveActorNotificationTarget(req.user);

    if (!recipientId || !recipientRole) {
      return res.status(400).json({ success: false, message: 'Data penerima notifikasi tidak valid' });
    }

    const [notifs] = await pool.query(
      `SELECT * FROM notifications
       WHERE recipient_id = ? AND recipient_role = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [recipientId, recipientRole]
    );

    const unreadCount = notifs.filter(n => !n.is_read).length;

    return res.json({ success: true, data: { notifications: notifs, unread_count: unreadCount } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Tandai satu notif sebagai sudah dibaca
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientId, recipientRole } = NotificationService.resolveActorNotificationTarget(req.user);

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ? AND recipient_role = ?',
      [id, recipientId, recipientRole]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Tandai semua sebagai sudah dibaca
const markAllAsRead = async (req, res) => {
  try {
    const { recipientId, recipientRole } = NotificationService.resolveActorNotificationTarget(req.user);

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND recipient_role = ?',
      [recipientId, recipientRole]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
