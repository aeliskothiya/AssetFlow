const express = require('express');
const { create, list, details, updateStatus } = require('../controllers/transferController');
const { protect, restrictTo } = require('../middleware/authGuard');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(create)
  .get(list);

router.route('/:transferId')
  .get(details);

router.route('/:transferId/status')
  .patch(restrictTo('Admin', 'Asset Manager', 'Department Head'), updateStatus);

module.exports = router;
