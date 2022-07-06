var jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    let token = req.headers['token'];

    if(!token) {
        res.send(401);
    } else {
        //primer parametro es para el token que estamos recibiendo
        //segundo parametro es la llave para desencriptar
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if(err) {
                res.send(401);
            } else {
                next();
            }
        })
    }
}