const express = require('express');
const router = express.Router();
const controller = require('../controllers/tasks');

router.get('/', controller.getAllTasks);
router.get('/:id', controller.getTaskById);
router.post('/', controller.createTask);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);
// router.post('/initialise-state',)

module.exports = router;