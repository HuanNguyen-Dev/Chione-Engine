const path = require('path');
exports.getMainPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
};
