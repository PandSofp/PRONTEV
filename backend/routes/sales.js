const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const auth = require('../middleware/auth');

router.post('/', auth, salesController.createSale);
router.get('/', auth, salesController.getAll);
router.get('/:id', auth, salesController.getById);
router.get('/branch/:branch_id', auth, salesController.getSalesByBranch);
router.delete('/:id', auth, salesController.remove);

module.exports = router;
