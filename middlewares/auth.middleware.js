const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        token = token.replace('Bearer ', '');
        
        if (token) {
            jwt.verify(token, process.env.JWT_KEY);
            return next();  
        }
        return res.status(403).json({error: "Access denied."});
    } catch(err) {
        return res.status(403).json({error: "Access denied."});
    }
}