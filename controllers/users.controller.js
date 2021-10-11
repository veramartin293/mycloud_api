const User = require('../models/user.model');
const { Validator } = require('node-input-validator');

module.exports.getOne = async (req, res) => {
    try {
        const user = await User.getOne(req.params.id);
        return res.status(200).json(user);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
}

module.exports.getAll = async (_req, res) => {
    try {
        const users = await User.getAll();
        return res.status(200).json(users);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
};

module.exports.create = async (req, res) => {
    try {
        // Get required fields from body
        const { name, email, password, role_id } = req.body; 
        const requiredFields = { name, email, password, role_id };

        // Make validations
        const validator = validate(requiredFields);
        const validated = await validator.check();
        if (!validated) {
            const responseObj = { errors: validator.errors };
            return res.status(422).json(responseObj);
        }

        // Create the user object and save it into DB
        let user = new User(requiredFields);
        user = await user.create();

        // Send successfull response
        return res.status(200).json(user);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
};

module.exports.update = async (req, res) => {
    try {
        // Get required fields from body
        const { name, email, password, role_id } = req.body; 
        const requiredFields = { name, email, password, role_id };

        // Make validations
        const validator = validate(requiredFields, false);
        const validated = await validator.check();
        if (!validated) {
            const responseObj = { errors: validator.errors };
            return res.status(422).json(responseObj);
        }

        // Create the user object and save it into DB
        requiredFields.id = Number(req.params.id);
        let user = new User(requiredFields);
        const updatedUser = await user.update();

        return res.status(200).json(updatedUser);
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
};

module.exports.delete = async(req, res) => {
    try {
        const user = new User({id: req.params.id});
        await user.delete();
        return res.status(200).json({message: 'User deleted successfully'});
    } catch (err) {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            error: err.message
        });
    }
};

// Validation depending on CREATING or UPDATING
function validate(data, isPostValidation = true) {
    // Password is required onlye when CREATING a new user
    let passwordValidation = 'string';
    passwordValidation = isPostValidation ? passwordValidation + '|required' : passwordValidation;

    const validator = new Validator(data, {
        name: 'required|string',
        email: 'required|email',
        password: passwordValidation,
        role_id: 'required|integer'
    });
    return validator;
}