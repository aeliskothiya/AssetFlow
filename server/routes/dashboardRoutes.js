const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { overview } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);
router.get('/overview', overview);

module.exports = router;
