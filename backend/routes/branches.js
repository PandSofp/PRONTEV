const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branchesController');
const auth = require('../middleware/auth');

router.get('/', auth, branchesController.getAll);
router.get('/:id', auth, branchesController.getById);
router.post('/', auth, branchesController.create);
router.put('/:id', auth, branchesController.update);
router.delete('/:id', auth, branchesController.remove);

module.exports = router;
