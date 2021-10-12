const express = require('express');
const auth = require('../controllers/auth.controller');

const router = express.Router();

router.route('/').post(auth.login);

module.exports = router;