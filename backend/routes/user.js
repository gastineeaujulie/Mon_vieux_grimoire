const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signUpUser);

router.post('/login', userCtrl.logInUser);

module.exports = router;
