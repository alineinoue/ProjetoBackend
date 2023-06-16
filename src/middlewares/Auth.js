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
                    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

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

/* if (!req.query.token && !req.body.token) {
          res.json({ notallowed: true });
          return;
        }
      
        let token = '';
        if (req.query.token) {
          token = req.query.token;
        }
        if (req.body.token) {
          token = req.body.token;
        }
      
        if (token === '') {
          res.json({ notallowed: true });
          return;
        }
      
        try {
          const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const user = await User.findOne({ token: decodedToken });
      
          if (!user) {
            res.json({ notallowed: true });
            return;
          }
      
          next();
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erro no servidor' });
        }
      }
      */