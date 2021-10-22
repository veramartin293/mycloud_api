const sharp = require('sharp');
const mimeTypes = require('mime-types');
const db = require('./db');

module.exports = class File {

    constructor (file, user_id) {
        this.id = null;
        this.name = file.filename;
        this.path = `/files/${file.filename}`;
        this.user_id = user_id;
        this.file_type = mimeTypes.extension(file.mimetype).toLowerCase();
        this.created_at = null;
        this.original_name = file.originalname;
    }

    // Store the file fields in DB
    async store() {
        try {
            // Create the thumbnail if the fail is an image
            const isFileAnImage = this.file_type === 'jpeg' ||
                this.file_type === 'jpg' ||
                this.file_type === 'png';

            if (isFileAnImage) {
                const thumbnailPath = `/files/thumb_${this.name}`;
                await sharp(`public/${this.path}`).resize({
                    width: Number(process.env.IMG_RESIZE_WIDTH)
                }).toFile(`./public/files/thumb_${this.name}`);
                this.path = thumbnailPath;
            }
            this.path = process.env.APP_URL + this.path; // From relative path to absolute path

            // Store file data into DB
            await db.execute(`
                INSERT INTO files (path, original_name, file_type, user_id) VALUES
                (?, ?, ?, ?)
            `, [this.path, this.original_name, this.file_type, this.user_id]);

            return true;
        } catch (err) {
            //1452 error code is a foreign key error
            if (err.errno === 1452) err.message = 'The user_id does not exist.'
            throw err;
        }
    }

    static async getAll(page = 1) {
        try {
            const pageSize = 10;
            const skippedRows = (page - 1) * pageSize;
            const [queryResponse] = await db.execute(`
            SELECT f.id, f.path, f.original_name, f.file_type, u.name as propetary, f.created_at
            FROM files f INNER JOIN users u ON f.user_id=u.id
            ORDER BY f.id DESC
            LIMIT ${pageSize} OFFSET ${skippedRows}
            `);
            return queryResponse;
        } catch(err) {
            throw err;
        }
    }
};