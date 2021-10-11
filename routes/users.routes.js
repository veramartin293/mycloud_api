const express = require('express');
const users = require('../controllers/users.controller');

const router = express.Router();

router.route('/')
    .get(users.getAll)
    .post(users.create);

router.route('/:id')
    .get(users.getOne)
    .put(users.update)
    .delete(users.delete);

module.exports = router;