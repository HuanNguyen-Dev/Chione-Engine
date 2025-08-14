const express = require('express');
const router = express.Router();
const {falling_snow,cellular_automata} = require('../controllers/simulation');

router.get('/falling_snow', controller.falling_snow);
router.get('/cellula_automata', controller.cellular_automata);


// router.post('/', controller.createTask);
// router.put('/:id', controller.updateTask);
// router.delete('/:id', controller.deleteTask);
// // router.post('/initialise-state',)

module.exports = router;