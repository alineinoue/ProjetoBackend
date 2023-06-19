const jwt = require('jsonwebtoken');
const { validationResult, matchedData } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

module.exports = {
  info: async (req, res) => {
    let token = req.query.token;

    try {
      // Verificar a validade do token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // O token é válido, pode prosseguir com a lógica do método
      
      const user = await User.findById(decoded.id);
      const products = await Product.find({ idUser: user._id.toString() });

      let productList = [];

      for (let i in products) {
        const cat = await Category.findById(products[i].category);

        productList.push({
          id: products[i]._id,
          title: products[i].title,
          price: products[i].price,
          description: products[i].description,
          amount: products[i].amount,
          category: cat.slug,
        });
      }

      res.json({
        name: user.name,
        email: user.email,
        products: productList,
      });
    } catch (error) {
      // O token é inválido ou expirou, retornar uma resposta de erro
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  },
  edit: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
      return;
    }
  
    const data = matchedData(req);
    const token = data.token;
  
    try {
      // Verificar a validade do token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // O token é válido, pode prosseguir com a lógica do método
  
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }
  
      if (data.name) {
        user.name = data.name;
      }
  
      if (data.email) {
        user.email = data.email;
      }
  
      await user.save();
  
      res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      // O token é inválido ou expirou, retornar uma resposta de erro
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  },  
};
