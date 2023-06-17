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
      const products = await Product.findOne({ idUser: user._id.toString() });

      let productList = [];

      for (let i in products) {
        const cat = await Category.findById(products[i].category);

        productList.push({
          id: products[i]._id,
          images: products[i].images,
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
        product: productList,
      });
    } catch (error) {
      // O token é inválido ou expirou, retornar uma resposta de erro
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  },
  edit: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() });
      return;
    }

    const data = matchedData(req);

    try {
      // Verificar a validade do token
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET_KEY);
      // O token é válido, pode prosseguir com a lógica do método

      let updates = {};
        
      if(data.name){
          updates.name = data.name;
      }

      if(data.email){
          const emailCheck = await User.findOne({email: data.email});
          if(emailCheck){
              res.json({error: 'Email já existe!'});
              return;
          }
          updates.email = data.email;
      }

      if(data.password){
          updates.password = data.password;
      }

      await User.findOneAndUpdate({token: data.token}, {$set: updates});

      res.json({});
    } catch (error) {
      // O token é inválido ou expirou, retornar uma resposta de erro
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  },
};
