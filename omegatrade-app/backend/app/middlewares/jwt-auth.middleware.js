const jwt = require('jsonwebtoken');

module.exports = {
    validateToken: (req, res, next) => {
        const authorizationHeaader = req.headers.authorization;
        if (authorizationHeaader) {
            const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
            const options = {
                expiresIn: process.env.EXPIRE_IN
            };
            jwt.verify(token, process.env.JWT_SECRET, options, async (err, result) => {
                if (err) {
                    return res.status(401).send({ message: `Session expired, please try login again!.`, success: false });
                }
                if (result) {
                    console.log(result);
                    req.decoded = result;
                    return next();
                }
            });
        } else {
            return res.status(401).send({ message: `Authentication error. Token required.`, success: false });
        }
    }
};