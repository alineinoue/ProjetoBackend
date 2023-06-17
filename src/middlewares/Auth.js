const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    private: async (req, res, next) => {
        let success = false;

        //Verificação de auth
        if(req.headers.authorization){
            const [authType, token] = req.headers.authorization.split(' ');
            if(authType === 'Bearer'){
                try{
                    jwt.verify(token, process.env.JWT_SECRET_KEY);

                    success = true;
                } catch(err){

                }
            }
        }

        if(success){
            next();
        } else {
            res.status(403); //Not authorized
            res.json({error: 'Não autorizado'});
        }

    }
}
