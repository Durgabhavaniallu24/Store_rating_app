const router = require('express').Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Submit or update rating
router.post('/:storeId', verifyToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has already rated this store
    const [existingRating] = await db.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await db.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
    } else {
      // Create new rating
      await db.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store ratings statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as total FROM ratings');
    res.json({ total: result[0].total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;