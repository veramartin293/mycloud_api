const db = require('./db');
const bcrypt = require('bcrypt');

module.exports = class User {

    constructor(user) {
        this.id = user.id || null;
        this.name = user.name;
        this.password = user.password;
        this.email = user.email;
        this.role_id = user.role_id;
    }

    static async getTotalCount() {
        try {
            const [queryResponse] = await db.execute('SELECT count(id) as count FROM users');
            return queryResponse[0].count;
        } catch(err) {
            throw err;
        }
    }

    // Get one user by id
    static async getOne(getBy, value) {
        try {
            const [queryResponse] = await db.execute(`
                SELECT u.id, u.name, u.email, r.name as role, u.created_at
                FROM users u INNER JOIN roles r ON u.role_id=r.id
                WHERE u.${getBy}=?
            `, [value]);
            const user = queryResponse[0];
            return user;
        } catch (err) {
            throw err;
        }
    }

    // Get all users
    static async getAll(page = 1) {
        try {
            const pageSize = 20;
            const skippedRows = (page - 1) * pageSize;
            const [users] = await db.execute(`
                SELECT u.id, u.name, u.email, r.name as role, u.created_at
                FROM users u INNER JOIN roles r ON u.role_id=r.id
                ORDER BY u.id DESC
                LIMIT ${pageSize} OFFSET ${skippedRows}
            `);
            return users;
        }
        catch(err) {
            throw err;
        }
    }

    // Create a new user
    async create() {
        try {
            this.sanitizeData();
            if (await this.exists()) {
                const error = new Error('The user already exists, please try with another email.');
                error.statusCode = 422;
                throw error;
            }

            // Encrypt password
            this.password = await bcrypt.hash(this.password, 10);

            const [queryResp] = await db.execute(
                'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
                [this.name, this.email, this.password, this.role_id]);
                this.id = queryResp.insertId;
            return await User.getOne('id', this.id);
        } catch (err) {
            //1452 error code is a foreign key error
            if (err.errno === 1452) err.message = 'The role_id is invalid.'
            throw err;
        }
    }

    async update() {
        try {
            this.sanitizeData();
            // Check if user exists
            if (!await this.exists('id')) {
                const error = new Error(`A user with id '${this.id}' does not exist.`);
                error.statusCode = 422;
                throw error;
            }
            // Check if new email is available
            if (!await this.isEmailAvailable(this.email)) {
                const error = new Error(`The user already exists, please try with another email.`);
                error.statusCode = 422;
                throw error;
            }

            // Create the query depending if we have password or not
            let sqlQuery = '';
            let paramArray = [];
            if (this.password) {
                sqlQuery = `UPDATE users SET name=?, email=?, password=?, role_id=? WHERE id=?`;
                paramArray = [this.name, this.email, this.password, this.role_id, this.id];
            } else {
                sqlQuery = `UPDATE users SET name=?, email=?, role_id=? WHERE id=?`;
                paramArray = [this.name, this.email, this.role_id, this.id];
            }
            const [queryResp] = await db.execute(sqlQuery, paramArray);
            const updatedUser = await User.getOne('id', this.id);
            return updatedUser;
        } catch (err) {
            if (err.errno === 1452) err.message = 'The role_id is invalid.'
            throw err            
        }
    }

    async delete() {
        try {
            // Check if user exists before deleting
            const userExists = await this.exists('id');
            if (!userExists) {
                const error = new Error(`A user with id '${this.id}' does not exist.`);
                error.statusCode = 422;
                throw error;
            }

            await db.execute('DELETE FROM users WHERE id=?', [this.id]);
            return true;
        } catch (err) {
            throw err;
        }
    }

    async exists(searchBy='email') {
        try {
            const [queryResp] = await db.execute(`SELECT * FROM users WHERE ${searchBy}=?`, [this[searchBy]]);
            if (queryResp.length === 0) {
                return false;
            }
            return true;
        } catch(err) {
            throw err;
        }
    }

    async isEmailAvailable() {
        try {
            const [queryResp] = await db.execute(`SELECT id FROM users WHERE email=?`, [this.email]);
            const emailAvailable = queryResp.length === 0 ||
                (queryResp.length === 1 && this.id === queryResp[0].id);
            return emailAvailable;
        } catch(err) {
            throw err;
        }
    }

    async getPassword() {
        try {
            const [queryResp] = await db.execute(`SELECT password FROM users WHERE email=?`, [this.email]);
            return queryResp[0].password;
        } catch(err) {
            throw err;
        }
    }

    sanitizeData() {
        if (this.name) this.name = this.name.trim();
        if (this.password) this.password = this.password.trim();
        if (this.email) this.email = this.email.trim();
    }
} 