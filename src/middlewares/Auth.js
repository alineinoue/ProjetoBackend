const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  private: async (req, res, next) => {
    try {
      // Verificação de autenticação
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(403).json({ error: 'Não autorizado' });
        return;
      }

      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
      // Buscar o usuário no banco de dados com base no ID do token
      const user = await User.findById(decodedToken.id);
      
      if (!user) {
        res.status(403).json({ error: 'Não autorizado' });
        return;
      }

      // Definir o usuário autenticado em req.user
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
};
