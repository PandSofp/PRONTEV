const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const auth = require('../middleware/auth');

router.get('/', auth, productsController.getAll);
router.get('/:id', auth, productsController.getById);
router.post('/', auth, productsController.create);
router.put('/:id', auth, productsController.update);
router.delete('/:id', auth, productsController.remove);

module.exports = router;
