const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');
const { authenticationToken } = require('../middlewares/jwt');

router.get('/:id',controller.login);
router.put('/:id',authenticationToken,controller.updateUser); // req auth
router.delete('/:id',authenticationToken,controller.deleteUser); // req auth
router.post('/register',controller.createUser);