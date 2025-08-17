const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');
const { authenticationToken } = require('../middlewares/jwt');

router.post('/login',controller.login);
router.put('/:id/update',authenticationToken,controller.updateUserPassword); // req auth
router.delete('/:id/delete',authenticationToken,controller.deleteUser); // req auth
router.post('/register',controller.createUser);