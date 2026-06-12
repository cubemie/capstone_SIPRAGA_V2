// backend/src/controllers/notificationController.js
const pool = require('../config/db');

// Ambil notifikasi untuk user yang login (warga, rt, atau rw)
const getNotifications = async (req, res) => {
  try {
    const { id_warga, id, role } = req.user;
    const recipientId   = id_warga || id;
    const recipientRole = role;

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
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Tandai semua sebagai sudah dibaca
const markAllAsRead = async (req, res) => {
  try {
    const { id_warga, id, role } = req.user;
    const recipientId   = id_warga || id;
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND recipient_role = ?',
      [recipientId, role]
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };