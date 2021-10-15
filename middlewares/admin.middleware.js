module.exports = (req, res, next) => {
    try {
        const isAdmin = req.user.role === 'admin';
        if (isAdmin) {
            return next();  
        }
        
        return res.status(403).json({error: "Only a administrator can access this resource."});
    } catch(err) {
        return res.status(403).json({error: "Only a administrator can access this resource."});
    }
}