const Category = require('../models/Category');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');



module.exports = {
    add: async (req, res) => {
        let {title, price, description, amount, cat, token} = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if(!title || !cat){
            return res.status(422).json({error: 'Titulo e/ou categoria não foram preenchidos'});
        }

        if(cat.length < 12){
            return res.status(400).json({error: 'ID de categoria inválido!'});
        }

        const category = await Category.findById(cat);
        if(!category){
            res.json({error: 'Categoria não existe'});
            return;
        }

        //Formatação do preço
        if(price){
            price = price.replace('.', '').replace(',', '.').replace('R$', '');
            price = parseFloat(price);
        } else {
            price = 0;
        }

        const newProduct = new Product();
        newProduct.idUser = user._id.toString();
        newProduct.category = cat;
        newProduct.title = title;
        newProduct.price = price;
        newProduct.description = description;

        const info = await newProduct.save();
        res.json({id: info._id});
    },
    getList: async (req, res) => {
        let { limit = 5, q, cat, page } = req.query;
        let total = 0;
        let filters = {};
      
        // Verifica se o valor do limit está entre 5, 10 ou 30
        if (![5, 10, 30].includes(parseInt(limit))) {
          return res.status(400).json({ error: 'Valor inválido para o parâmetro limit, o valor deve ser 5, 10 ou 30' });
        }
      
        if (q) {
          filters.title = { '$regex': q, '$options': 'i' };
        }
      
        if (cat) {
          const c = await Category.findOne({ slug: cat }).exec();
          if (c) {
            filters.category = c._id.toString();
          }
        }
      
        const productsTotal = await Product.find(filters).exec();
        total = productsTotal.length;
      
        const startIndex = (page - 1) * limit;
      
        const productsData = await Product.find(filters)
          .skip(startIndex)
          .limit(parseFloat(limit))
          .exec();
      
        let products = [];
      
        for (let i in productsData) {
          products.push({
            id: productsData[i]._id,
            title: productsData[i].title,
            price: productsData[i].price,
            description: productsData[i].description,
          });
        }
      
        res.json({ products, total });
    },      
    getItem: async (req, res) => {
        let {id, other = null} = req.query;

        if(!id){
            res.status(400).json({ error: 'Sem produto' });
            return;            
        }

        if(id.length < 12){
            res.status(400).json({ error: 'ID inválido' });
            return;            
        }   

        const product = await Product.findById(id);
        if(!product){
            res.status(404).json({ error: 'Produto inexistente' });
        }

        let category = await Category.findById(product.category).exec();
        let userInfo = await User.findById(product.idUser).exec();

        let others = [];
        if(other) {
            const otherData = await Product.find({idUser: product.idUser}).exec();

            for(let i in otherData){
                if(otherData[i]._id.toString() != product._id.toString()){

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        description: otherData[i].description,
                        amount: otherData[i].amount,
                    })

                } 
            }
        }

        res.json({
            id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            amount: product.amount,
            category, 
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            others
        });
    },
    edit: async (req, res) => {
        let { id } = req.params;
        let { title, price, description, amount, cat, token } = req.body;
    
        if (id.length < 12) {
            return res.status(400).json({ error: 'ID inválido' });
        }
    
        const product = await Product.findById(id).exec();
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado!' });
        }
    
        let user;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            user = await User.findById(decoded.id);
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    
        if (user && user._id.toString() !== product.idUser) {
            res.status(401).json({ error: "Você não tem permissão para modificar este produto" });
            return;
        }
    
        let updates = {};
    
        if (title) {
            updates.title = title;
        }
    
        if (price) {
            price = price.replace('.', '').replace(',', '.').replace('R$', '');
            price = parseFloat(price);
            updates.price = price;
        }
    
        if (amount) {
            updates.amount = amount;
        }
    
        if (description) {
            updates.description = description;
        }
    
        if (cat) {
            const category = await Category.findOne({ slug: cat }).exec();
            if (!category) {
                return res.status(404).json({ error: 'Categoria não existe!' });
            }
            updates.category = category._id.toString();
        }

        await Product.findByIdAndUpdate(id, { $set: updates });
    
        res.status(200).json({ mensagem: 'Produto editado com sucesso!' });

    },
    delete: async (req, res) => {
        const { id } = req.params;
    
        if (id.length < 12) {
            return res.status(400).json({ error: 'ID inválido' });
        }
    
        try {
            const product = await Product.findById(id).exec();
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado!' });
            }
    
            await Product.deleteOne({ _id: id });
    
            res.status(200).json({ mensagem: 'Produto excluído com sucesso!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no servidor' });
        }
    },
};