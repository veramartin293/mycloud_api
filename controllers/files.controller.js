const upload = require('../middlewares/multer.middleware');
const File = require('../models/file.model');
const niv = require('node-input-validator');
// Add configurations to niv object
niv.addCustomMessages({
    'file.required': 'A file is madatory.'
});

// Validate the input data on POST requests
function validate(data) {
    const validator = new niv.Validator(data, {
        file: 'required'
    });
    return validator;
}

// Upload a single file
const uploadFile = (req, res) => {
    // upload acts as a middleware
    upload(req, res, async function (err) {
        try {
            // Handling the upload errors
            if (err) {
                if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    errorMessage = 'You can upload only 1 file.';
                }

                if (err.code === 'LIMIT_FILE_SIZE') {
                    errorMessage = `The file can not exceed ${process.env.FILE_SIZE_MB}MB.`
                }

                if (err.code === 'LIMIT_TYPE') {
                    errorMessage = `A valid file type is required (jpg, jpeg, png, docx, xlsx, csv).`
                }
                return res.status(422).json({error: errorMessage});
            }
            // Everything went fine with the upload.
    
            // Validate data
            const validator = validate({ file: req.file });
            const validated = await validator.check();
            if (!validated) {
                const responseObj = { errors: validator.errors };
                return res.status(422).json(responseObj);
            }
    
            // Store the file in DB
            const fileObj = new File(req.file, req.user.id);
            if (await fileObj.store()) {
                res.status(200).json({message: 'File stored successfully.'})
            }
        } catch(err) {
            const statusCode = err.statusCode || 500;
            return res.status(statusCode).json({
                error: err.message
            });
        }
    });
};

// Get all the files
const getAll = async (req, res) => {
    try {
        // Get and validate the page number
        let page = parseInt(req.query.page);
        if (isNaN(page) || !page) {
            page = 1;
        }

        const files = await File.getAll(page);
        return res.status(200).json(files);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
}
module.exports = { uploadFile, getAll };