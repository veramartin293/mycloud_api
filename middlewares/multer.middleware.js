const multer = require('multer');
const mimeTypes = require('mime-types');

const fileSize = parseInt(process.env.FILE_SIZE_MB);

const storage = multer.diskStorage({
    destination: 'public/files/',
    filename: function(_req, file, cb) {
        cb(null, Date.now() + "." + mimeTypes.extension(file.mimetype).toLowerCase());
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(_req, file, cb) {
        const fileType = mimeTypes.extension(file.mimetype).toLowerCase();
        const acceptedTypes = ['jpg', 'jpeg', 'png', 'docx', 'xlsx', 'csv'];
        if (!acceptedTypes.includes(fileType)) {
            const err = new Error('A valid file type is mandatory (jpg, jpeg, png, docx, xlsx, csv).');
            err.code= 'LIMIT_TYPE';
            return cb(err);
        }
        return cb(null, true);
    },
    limits: { fileSize: fileSize * 1024 * 1024 }
});

module.exports = upload.single('file');