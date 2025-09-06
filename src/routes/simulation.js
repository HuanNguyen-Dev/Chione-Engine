const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticateToken } = require('../middleware/jwt');
const {fallingSnow,fallingSnowVideo, showRenderPage,saveFallingSnowVideo} = require('../controllers/simulation');

router.post('/falling-snow-calculation', fallingSnow);
router.get("/simulation-snow-page", (req, res) => {
   res.sendFile(path.join(__dirname,"..", '..',"public", "cloud.html"));
});
router.post('/simulation-snowfall-video', fallingSnowVideo);
router.post('/save-snowfall-simulation',saveFallingSnowVideo);


router.get("/3d-snowfall-simulation", authenticateToken,showRenderPage);


module.exports = router;