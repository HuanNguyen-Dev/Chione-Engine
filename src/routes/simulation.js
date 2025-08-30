const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticateToken } = require('../middleware/jwt');
const {falling_snow,falling_snow_video, showRenderPage,save_falling_snow_video} = require('../controllers/simulation');

router.post('/falling-snow-calculation', falling_snow);
router.get("/simulation-snow-page", (req, res) => {
   res.sendFile(path.join(__dirname,"..", '..',"public", "cloud.html"));
});
router.post('/simulation-snowfall-video', falling_snow_video);
router.post('/save-snowfall-simulation',save_falling_snow_video);


router.get("/3d-snowfall-simulation", authenticateToken,showRenderPage);


module.exports = router;