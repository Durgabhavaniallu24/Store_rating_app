const router = require('express').Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin, isStoreOwner } = require('../middleware/auth.middleware');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const [stores] = await db.execute(`
      SELECT s.*, u.name as owner_name, 
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as average_rating,
      (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) as user_rating
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
    `, [req.user?.id]);

    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store statistics
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as total FROM stores');
    res.json({ total: result[0].total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store owner's store
router.get('/owner', verifyToken, isStoreOwner, async (req, res) => {
  try {
    const [stores] = await db.execute(`
      SELECT s.*, 
      (SELECT AVG(rating) FROM ratings WHERE store_id = s.id) as average_rating,
      (SELECT COUNT(*) FROM ratings WHERE store_id = s.id) as total_ratings
      FROM stores s
      WHERE s.owner_id = ?
    `, [req.user.id]);

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(stores[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create store (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, address, ownerId } = req.body;

    const [result] = await db.execute(
      'INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)',
      [name, address, ownerId]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      address,
      owner_id: ownerId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;