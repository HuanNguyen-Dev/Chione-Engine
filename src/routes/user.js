const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');
const { authenticateToken } = require('../middleware/jwt');

router.post('/login',controller.login);
router.get('/login', controller.showLoginPage);

router.put('/:id/update',authenticateToken,controller.updateUserPassword); // req auth
router.get('/:id/update', authenticateToken,controller.showDeletePage);

router.delete('/:id/delete',authenticateToken,controller.deleteUser); // req auth
router.get('/:id/delete', authenticateToken,controller.showDeletePage) // req auth

router.post('/register',controller.createUser);
router.get('/register', controller.showRegisterPage);

router.get('/me', authenticateToken, controller.getUserCookieInfo);
module.exports = router;