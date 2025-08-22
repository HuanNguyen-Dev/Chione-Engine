const express = require('express');
const path = require('path');
const router = express.Router();
<<<<<<< HEAD
const {falling_snow,cellular_automata,falling_snow_video,} = require('../controllers/simulation');
=======
const { authenticateToken } = require('../middleware/jwt');
const {falling_snow,cellular_automata,falling_snow_video, showRenderPage,} = require('../controllers/simulation');
>>>>>>> cookies

router.post('/falling_snow', falling_snow);
router.post('/cellula_automata', cellular_automata);
router.get("/cloud_simulation", (req, res) => {
   res.sendFile(path.join(__dirname,"..", '..',"public", "cloud.html"));
});
router.post('/falling_snow_video', falling_snow_video);

router.get("/3d_simulation", authenticateToken,showRenderPage)

router.get("/3d_simulation", (req,res) => {
   res.sendFile(path.join(__dirname,"..","public","cloud.html"));
})

module.exports = router;