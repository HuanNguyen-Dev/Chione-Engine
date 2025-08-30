const express = require('express');
const path = require('path');
const router = express.Router();
const { authenticateToken } = require('../middleware/jwt');
const {falling_snow,falling_snow_video, showRenderPage,save_falling_snow_video} = require('../controllers/simulation');

router.post('/falling_snow_calculation', falling_snow);
router.get("/falling_snow_page", (req, res) => {
   res.sendFile(path.join(__dirname,"..", '..',"public", "cloud.html"));
});
router.post('/falling_snow_video', falling_snow_video);
router.post('/save_falling_snow_video',save_falling_snow_video);


router.get("/3d_simulation_page", authenticateToken,showRenderPage);


module.exports = router;