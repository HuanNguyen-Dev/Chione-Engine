const express = require('express');
const path = require('path');
const router = express.Router();
const {falling_snow,cellular_automata,falling_snow_video} = require('../controllers/simulation');

router.post('/falling_snow', falling_snow);
router.post('/cellula_automata', cellular_automata);
router.get("/cloud_simulation", (req, res) => {
   res.sendFile(path.join(__dirname,"..", "public", "cloud.html"));
});
router.post('/falling_snow_video', falling_snow_video);
// router.post('/', controller.createTask);
// router.put('/:id', controller.updateTask);
// router.delete('/:id', controller.deleteTask);
// // router.post('/initialise-state',)

module.exports = router;