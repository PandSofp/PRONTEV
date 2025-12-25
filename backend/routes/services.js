const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const auth = require('../middleware/auth');

router.get('/', auth, servicesController.getAll);
router.get('/:id', auth, servicesController.getById);
router.post('/', auth, servicesController.create);
router.put('/:id', auth, servicesController.update);
router.delete('/:id', auth, servicesController.remove);

module.exports = router;
