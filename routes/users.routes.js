const express = require('express');
const users = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.route('/')
    .get(users.getAll)
    .post(users.create);

router.route('/:id')
    .get(users.getOne)
    .put(users.update)
    .delete(users.delete);

module.exports = router;