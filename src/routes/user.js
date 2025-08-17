const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');
const path = require('path');
const { authenticateToken } = require('../middleware/jwt');

router.post('/login',controller.login);
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.put('/:id/update',authenticateToken,controller.updateUserPassword); // req auth
router.get('/:id/update', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'option.html'));
});

router.delete('/:id/delete',authenticateToken,controller.deleteUser); // req auth
router.get('/:id/delete', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'option.html'));
});

router.post('/register',controller.createUser);
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});
module.exports = router;