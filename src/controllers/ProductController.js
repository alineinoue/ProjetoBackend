const Category = require('../models/Category');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');



module.exports = {
    getCategorias: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for(let i in cats) {
            categories.push({
                ...cats[i]._doc
            });
        }

        res.json({categories});

    },
    add: async (req, res) => {
        let {title, price, description, amount, cat, token} = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.id);

        if(!title || !cat){
            res.json({error: 'Titulo e/ou categoria não foram preenchidos'});
            return;
        }

        if(cat.length < 12){
            res.json({error: 'ID de categoria inválido!'});
            return;
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
        newProduct.amount = amount;
        newProduct.description = description;

        const info = await newProduct.save();
        res.json({id: info._id});
    },
    getList: async (req, res) => {
        let {limit = 5, q, cat, page } = req.query;
        let total = 0;
        let filters = {}; 
    
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
            res.json({error: 'Sem produto'});
            return;
        }

        if(id.length < 12){
            res.json({error: 'ID inválido'});
            return;
        }   

        const product = await Product.findById(id);
        if(!product){
            res.json({error: 'Produto inexistente'});
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
            res.json({ error: 'ID inválido' });
            return;
        }
    
        const product = await Product.findById(id).exec();
        if (!product) {
            res.json({ error: 'Produto não encontrado!' });
            return;
        }
    
        let user;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            user = await User.findById(decoded.id);
        } catch (error) {
            res.json({ error: 'Token inválido' });
            return;
        }
    
        if (user && user._id.toString() !== product.idUser) {
            res.json({ error: "Você não tem permissão para modificar este produto" });
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
                res.json({ error: 'Categoria não existe' });
                return;
            }
            updates.category = category._id.toString();
        }

        await Product.findByIdAndUpdate(id, { $set: updates });
    
        res.json({ mensagem: 'Produto editado com sucesso!' });
    },
    
};