const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get all users (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT u.*, 
      (SELECT AVG(r.rating) FROM ratings r 
       INNER JOIN stores s ON r.store_id = s.id 
       WHERE s.owner_id = u.id) as rating
      FROM users u
    `);
    
    users.forEach(user => {
      delete user.password;
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as total FROM users');
    res.json({ total: result[0].total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update password
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;