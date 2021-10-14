const express = require('express');
const files = require('../controllers/files.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

const router = express.Router();
//router.use(authMiddleware);

router.post('/', files.uploadFile);
router.get('/', files.getAll);

module.exports = router;