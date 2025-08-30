const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticateToken } = require('../middleware/jwt');
const {falling_snow,falling_snow_video, showRenderPage,} = require('../controllers/simulation');

router.post('/falling_snow', falling_snow);
router.get("/cloud_simulation", (req, res) => {
   res.sendFile(path.join(__dirname,"..", '..',"public", "cloud.html"));
});

router.post('/falling_snow_video', falling_snow_video);
router.get("/3d_simulation", authenticateToken,showRenderPage)

module.exports = router;