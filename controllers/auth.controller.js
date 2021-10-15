const User = require('../models/user.model');
const { Validator } = require('node-input-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.login = async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Make validations
        const validator = validate({email, password});
        const validated = validator.check();
        if (!validated) {
            const responseObj = { errors: validator.errors };
            return res.status(422).json(responseObj);
        }
        email.trim();
        password.trim();

        // Verify email and password are correct
        let user = new User({email, password});
        const userEmailExists = await user.exists();
        let hashedPassword = '';

        if (userEmailExists) {
            hashedPassword = await user.getPassword();
        }
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword); 
        if (!userEmailExists || !isPasswordCorrect) {
            const responseObj = { error: 'Wrong credentials.' };
            return res.status(422).json(responseObj);
        }

        // Get all the data for the authenticated user
        user = await User.getOne('email', user.email);

        // Create and send the token
        const token = jwt.sign({user}, process.env.JWT_KEY, {expiresIn: '30d'});
        return res.status(200).json({token});
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
}

function validate(data) {
    const validator = new Validator(data, {
        email: 'required|email',
        password: 'required|string',
    });
    return validator;
}